package com.wayhome.service;

import com.wayhome.dto.CreateUserRequest;
import com.wayhome.exception.ForbiddenException;
import com.wayhome.model.Role;
import com.wayhome.model.User;
import com.wayhome.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class UserService {
    private static final Pattern EMAIL = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User create(CreateUserRequest req, Long actorId) {
        if (req.getName() == null || req.getName().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        String email = req.getEmail().trim().toLowerCase(Locale.ROOT);
        if (!EMAIL.matcher(email).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }
        if (req.getPassword() == null || req.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }
        if (req.getRole() == null || req.getRole().isBlank()) {
            throw new IllegalArgumentException("Role is required");
        }

        Role role;
        try {
            role = Role.valueOf(req.getRole().trim().replace(' ', '_').toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + req.getRole());
        }

        String status = "Active";
        if (req.getStatus() != null && !req.getStatus().isBlank()) {
            status = "Blocked".equalsIgnoreCase(req.getStatus().trim()) ? "Blocked" : "Active";
        }

        User user = User.builder()
                .name(req.getName().trim())
                .email(email)
                .phone(req.getPhone() != null ? req.getPhone().trim() : null)
                .password(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .status(status)
                .createdAt(LocalDateTime.now())
                .build();

        User saved = userRepository.save(user);
        auditLogService.log(actorId, "CREATE", "User", saved.getId(), "User created by admin: " + saved.getEmail() + " (" + role + ")");
        return saved;
    }

    @Transactional(readOnly = true)
    public List<User> listAll() {
        return list(null, null, null);
    }

    @Transactional(readOnly = true)
    public List<User> list(String search, String role, String status) {
        return userRepository.findAll().stream()
                .filter(user -> {
                    if (search == null || search.isBlank()) return true;
                    String q = search.toLowerCase(Locale.ROOT);
                    return (user.getName() != null && user.getName().toLowerCase(Locale.ROOT).contains(q))
                            || (user.getEmail() != null && user.getEmail().toLowerCase(Locale.ROOT).contains(q))
                            || (user.getPhone() != null && user.getPhone().toLowerCase(Locale.ROOT).contains(q));
                })
                .filter(user -> {
                    if (role == null || role.isBlank()) return true;
                    try {
                        return user.getRole() == Role.valueOf(role.trim().replace(' ', '_').toUpperCase(Locale.ROOT));
                    } catch (IllegalArgumentException ex) {
                        return false;
                    }
                })
                .filter(user -> status == null || status.isBlank() || status.equalsIgnoreCase(user.getStatus()))
                .toList();
    }

    @Transactional(readOnly = true)
    public User getById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    @Transactional
    public User update(Long id, User changes, Long actorId) {
        User user = getById(id);
        if (changes.getName() != null) {
            if (changes.getName().isBlank()) throw new IllegalArgumentException("Name is required");
            user.setName(changes.getName().trim());
        }
        if (changes.getEmail() != null && !changes.getEmail().isBlank() && !changes.getEmail().equalsIgnoreCase(user.getEmail())) {
            String email = changes.getEmail().trim().toLowerCase(Locale.ROOT);
            if (!EMAIL.matcher(email).matches()) throw new IllegalArgumentException("Invalid email");
            if (userRepository.existsByEmail(email)) throw new IllegalArgumentException("Email already registered");
            user.setEmail(email);
        }
        if (changes.getPhone() != null) user.setPhone(changes.getPhone().trim());
        User saved = userRepository.save(user);
        auditLogService.log(actorId, "UPDATE", "User", id, "User profile updated: " + saved.getEmail());
        return saved;
    }

    /** Backward-compatible helper used by self-service profile updates. */
    @Transactional
    public User update(Long id, User changes) {
        return update(id, changes, id);
    }

    @Transactional
    public User changeRole(Long id, Role newRole, Long actorId) {
        if (newRole == null) throw new IllegalArgumentException("Invalid role");
        User user = getById(id);
        if (actorId != null && actorId.equals(id) && user.getRole() == Role.ADMIN && newRole != Role.ADMIN) {
            throw new ForbiddenException("An administrator cannot remove their own ADMIN role");
        }
        Role previousRole = user.getRole();
        user.setRole(newRole);
        User saved = userRepository.save(user);
        auditLogService.log(actorId, "CHANGE_ROLE", "User", id, "Role changed from " + previousRole + " to " + newRole);
        return saved;
    }

    @Transactional
    public User blockUnblock(Long id, Long actorId) {
        User user = getById(id);
        if (actorId != null && actorId.equals(id)) throw new ForbiddenException("You cannot block your own account");
        String previousStatus = user.getStatus();
        user.setStatus("Blocked".equalsIgnoreCase(user.getStatus()) ? "Active" : "Blocked");
        User saved = userRepository.save(user);
        auditLogService.log(actorId, "BLOCK_UNBLOCK", "User", id, "Status changed from " + previousStatus + " to " + saved.getStatus());
        return saved;
    }

    @Transactional
    public void delete(Long id, Long actorId) {
        if (actorId != null && actorId.equals(id)) {
            throw new ForbiddenException("You cannot delete your own account from Admin User Management");
        }
        User user = getById(id);
        userRepository.delete(user);
        auditLogService.log(actorId, "DELETE", "User", id, "User deleted: " + user.getEmail());
    }
}
