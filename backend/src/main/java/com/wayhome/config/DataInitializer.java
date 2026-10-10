package com.wayhome.config;

import com.wayhome.model.*;
import com.wayhome.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final UniversityRepository universityRepository;
    private final StudentAccommodationRepository accommodationRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-demo-data:false}")
    private boolean seedDemoData;

    @Override
    @Transactional
    public void run(String... args) {

        if (!seedDemoData) {
            return;
        }

        System.out.println("======================================");
        System.out.println("WAYHOME DEMO DATA SEEDING STARTED");
        System.out.println("======================================");

        /*
         * IMPORTANT:
         * We DO NOT use:
         *
         * if (userRepository.count() > 0) return;
         *
         * because that was preventing properties from being created
         * after a real user registered.
         */

        User admin = getOrCreateUser(
                "Arjun Kapoor",
                "arjun.kapoor@wayhome.example",
                Role.ADMIN,
                "+91 98110 00001"
        );

        User danishAdmin = getOrCreateUser(
                "Danish Ahmad",
                "danishahamd3773@gmail.com",
                Role.ADMIN,
                "+91 98110 00000"
        );

        User manager = getOrCreateUser(
                "Rohit Sharma",
                "rohit.sharma@example.com",
                Role.PROPERTY_MANAGER,
                "+91 98110 00002"
        );

        User tenant = getOrCreateUser(
                "Vikram Singh",
                "vikram.singh@example.com",
                Role.TENANT,
                "+91 98110 00004"
        );

        User student = getOrCreateUser(
                "Aarav Mehta",
                "aarav.mehta@example.com",
                Role.STUDENT,
                "+91 98110 00006"
        );

        /*
         * ============================================================
         * REALISTIC PROPERTY DATA
         * ============================================================
         */

        List<PropertySeed> properties = List.of(

                // =========================
                // NOIDA PG
                // =========================

                new PropertySeed(
                        "VIBE VILLA Premium PG & Co-Living",
                        "PG",
                        "Noida",
                        "Uttar Pradesh",
                        "Sector 132, Noida",
                        12000,
                        2,
                        1,
                        500,
                        28.5295,
                        77.3640,
                        "Girls & Boys",
                        "Double Sharing / Private Room",
                        "/assets/properties/studio-1.jpg"
                ),

                new PropertySeed(
                        "Apna Niwas PG",
                        "PG",
                        "Noida",
                        "Uttar Pradesh",
                        "Sector 26, Noida",
                        9000,
                        2,
                        1,
                        450,
                        28.5800,
                        77.3270,
                        "Girls",
                        "Double / Triple Sharing",
                        "/assets/properties/studio-3.jpg"
                ),

                new PropertySeed(
                        "Apna Niwas PG",
                        "PG",
                        "Noida",
                        "Uttar Pradesh",
                        "Sector 37, Noida",
                        9000,
                        2,
                        1,
                        450,
                        28.5660,
                        77.3360,
                        "Girls",
                        "Double / Triple Sharing",
                        "/assets/properties/studio-1.jpg"
                ),

                new PropertySeed(
                        "Apna Niwas PG",
                        "PG",
                        "Noida",
                        "Uttar Pradesh",
                        "Sector 46, Noida",
                        9000,
                        2,
                        1,
                        500,
                        28.5635,
                        77.3500,
                        "Girls",
                        "Double / Triple Sharing",
                        "/assets/properties/studio-2.jpg"
                ),

                new PropertySeed(
                        "PG & Rooms Independent",
                        "PG",
                        "Noida",
                        "Uttar Pradesh",
                        "Sector 135, Noida",
                        8500,
                        2,
                        1,
                        550,
                        28.5010,
                        77.3920,
                        "Girls & Boys",
                        "Private / Double / Triple",
                        "/assets/properties/studio-3.jpg"
                ),

                new PropertySeed(
                        "HELLO PG",
                        "PG",
                        "Noida",
                        "Uttar Pradesh",
                        "Sector 104, Noida",
                        15000,
                        1,
                        1,
                        400,
                        28.5550,
                        77.3820,
                        "Co-ed",
                        "Single / Twin Sharing",
                        "/assets/properties/studio-1.jpg"
                ),

                new PropertySeed(
                        "PG Villa",
                        "PG",
                        "Noida",
                        "Uttar Pradesh",
                        "Sector 126, Noida Expressway",
                        11100,
                        2,
                        1,
                        500,
                        28.5320,
                        77.3330,
                        "Co-ed",
                        "Twin / Triple Sharing",
                        "/assets/properties/studio-2.jpg"
                ),

                new PropertySeed(
                        "Campus Corner PG",
                        "PG",
                        "Greater Noida",
                        "Uttar Pradesh",
                        "Knowledge Park II",
                        9000,
                        2,
                        1,
                        450,
                        28.4620,
                        77.4870,
                        "Students",
                        "Double Sharing",
                        "/assets/properties/studio-3.jpg"
                ),

                // =========================
                // GREATER NOIDA PG
                // =========================

                new PropertySeed(
                        "OLE STAYS",
                        "PG",
                        "Greater Noida",
                        "Uttar Pradesh",
                        "Alpha I",
                        7999,
                        2,
                        1,
                        500,
                        28.4680,
                        77.5050,
                        "Girls & Boys",
                        "Double / Triple Sharing",
                        "/assets/properties/studio-1.jpg"
                ),

                new PropertySeed(
                        "Apna Niwas Boys PG",
                        "PG",
                        "Greater Noida",
                        "Uttar Pradesh",
                        "Panchsheel Green",
                        8999,
                        2,
                        1,
                        500,
                        28.6160,
                        77.4300,
                        "Boys",
                        "Private / Double / Triple",
                        "/assets/properties/studio-2.jpg"
                ),

                new PropertySeed(
                        "SHARMA PG",
                        "PG",
                        "Greater Noida",
                        "Uttar Pradesh",
                        "Sector 3 Greater Noida West",
                        8000,
                        2,
                        1,
                        450,
                        28.6200,
                        77.4340,
                        "Students",
                        "Double Sharing",
                        "/assets/properties/studio-3.jpg"
                ),

                new PropertySeed(
                        "Dereks PG",
                        "PG",
                        "Greater Noida",
                        "Uttar Pradesh",
                        "Sector 4 Greater Noida West",
                        9000,
                        2,
                        1,
                        500,
                        28.6210,
                        77.4380,
                        "Students",
                        "Double / Private",
                        "/assets/properties/studio-1.jpg"
                ),

                new PropertySeed(
                        "BTS PG - Singh Niwas",
                        "PG",
                        "Greater Noida",
                        "Uttar Pradesh",
                        "Sector 4 Greater Noida West",
                        8500,
                        2,
                        1,
                        480,
                        28.6220,
                        77.4390,
                        "Boys",
                        "Double / Triple / Private",
                        "/assets/properties/studio-2.jpg"
                ),

                new PropertySeed(
                        "Yuvi Living PG",
                        "PG",
                        "Greater Noida",
                        "Uttar Pradesh",
                        "Delta II",
                        10000,
                        2,
                        1,
                        500,
                        28.4770,
                        77.5230,
                        "Girls & Boys",
                        "Double / Triple",
                        "/assets/properties/studio-3.jpg"
                ),

                new PropertySeed(
                        "R&R Luxury Living",
                        "PG",
                        "Greater Noida",
                        "Uttar Pradesh",
                        "Sector 3 Greater Noida West",
                        14000,
                        1,
                        1,
                        550,
                        28.6190,
                        77.4330,
                        "Students & Professionals",
                        "Private Room",
                        "/assets/properties/studio-1.jpg"
                ),

                // =========================
                // HOSTELS
                // =========================

                new PropertySeed(
                        "Apna Niwas Boys Hostel",
                        "Hostel",
                        "Noida",
                        "Uttar Pradesh",
                        "Sector 125, Noida",
                        9999,
                        2,
                        1,
                        500,
                        28.5460,
                        77.3330,
                        "Boys",
                        "Private / Double / Triple",
                        "/assets/properties/apartment-3.jpg"
                ),

                new PropertySeed(
                        "Campus View Hostel",
                        "Hostel",
                        "Greater Noida",
                        "Uttar Pradesh",
                        "Knowledge Park II",
                        7500,
                        3,
                        2,
                        650,
                        28.3730,
                        77.5430,
                        "Students",
                        "Triple Sharing",
                        "/assets/properties/studio-2.jpg"
                ),

                new PropertySeed(
                        "Sunrise Boys Hostel",
                        "Hostel",
                        "Noida",
                        "Uttar Pradesh",
                        "Sector 125",
                        8000,
                        2,
                        1,
                        550,
                        28.5470,
                        77.3350,
                        "Boys",
                        "Double Sharing",
                        "/assets/properties/apartment-3.jpg"
                ),

                new PropertySeed(
                        "Scholar's Nest Hostel",
                        "Hostel",
                        "Greater Noida",
                        "Uttar Pradesh",
                        "Alpha II",
                        8500,
                        2,
                        1,
                        600,
                        28.4700,
                        77.5100,
                        "Students",
                        "Double Sharing",
                        "/assets/properties/studio-2.jpg"
                ),

                new PropertySeed(
                        "University Stay Hostel",
                        "Hostel",
                        "Greater Noida",
                        "Uttar Pradesh",
                        "Knowledge Park III",
                        7800,
                        3,
                        2,
                        700,
                        28.4510,
                        77.4900,
                        "Students",
                        "Triple Sharing",
                        "/assets/properties/apartment-2.jpg"
                ),

                // =========================
                // VILLAS
                // =========================

                new PropertySeed(
                        "Amrapali Dream Valley Villa",
                        "Villa",
                        "Greater Noida",
                        "Uttar Pradesh",
                        "Techzone IV",
                        29500,
                        3,
                        3,
                        1690,
                        28.6160,
                        77.4350,
                        "Family",
                        "3.5 BHK",
                        "/assets/properties/apartment-3.jpg"
                ),

                new PropertySeed(
                        "Amrapali Dream Valley Premium Villa",
                        "Villa",
                        "Greater Noida",
                        "Uttar Pradesh",
                        "Techzone IV",
                        50000,
                        5,
                        4,
                        2950,
                        28.6170,
                        77.4360,
                        "Family",
                        "5 BHK",
                        "/assets/properties/apartment-3.jpg"
                ),

                new PropertySeed(
                        "Amrapali Leisure Valley Villa",
                        "Villa",
                        "Greater Noida",
                        "Uttar Pradesh",
                        "Techzone IV",
                        30500,
                        3,
                        4,
                        1825,
                        28.6180,
                        77.4370,
                        "Family",
                        "3 BHK",
                        "/assets/properties/apartment-3.jpg"
                ),

                new PropertySeed(
                        "Kingson Green Villa 2",
                        "Villa",
                        "Greater Noida",
                        "Uttar Pradesh",
                        "Bhangel, Noida Extension",
                        20000,
                        3,
                        3,
                        1475,
                        28.5960,
                        77.4070,
                        "Family",
                        "3.5 BHK",
                        "/assets/properties/apartment-2.jpg"
                ),

                new PropertySeed(
                        "Paradise Greens Villas",
                        "Villa",
                        "Greater Noida",
                        "Uttar Pradesh",
                        "Sector 16 Greater Noida West",
                        30000,
                        3,
                        3,
                        2150,
                        28.6060,
                        77.4300,
                        "Family",
                        "3.5 BHK",
                        "/assets/properties/apartment-3.jpg"
                ),

                new PropertySeed(
                        "Swarn Nagari Family Villa",
                        "Villa",
                        "Greater Noida",
                        "Uttar Pradesh",
                        "Swarn Nagari",
                        25000,
                        3,
                        3,
                        1500,
                        28.4650,
                        77.5200,
                        "Family",
                        "3 BHK",
                        "/assets/properties/apartment-2.jpg"
                ),

                new PropertySeed(
                        "Godrej Golf Links Villa",
                        "Villa",
                        "Greater Noida",
                        "Uttar Pradesh",
                        "Jaypee Greens",
                        68000,
                        4,
                        4,
                        2350,
                        28.5600,
                        77.5050,
                        "Family",
                        "4 BHK",
                        "/assets/properties/apartment-3.jpg"
                ),

                new PropertySeed(
                        "Godrej The Suites Villa",
                        "Villa",
                        "Greater Noida",
                        "Uttar Pradesh",
                        "Jaypee Greens",
                        60000,
                        4,
                        4,
                        2300,
                        28.5580,
                        77.5030,
                        "Family",
                        "4.5 BHK",
                        "/assets/properties/apartment-3.jpg"
                ),

                new PropertySeed(
                        "Sector 19 Independent Villa",
                        "Villa",
                        "Noida",
                        "Uttar Pradesh",
                        "Sector 19",
                        75000,
                        3,
                        4,
                        2800,
                        28.5800,
                        77.3200,
                        "Family / Bachelor",
                        "3 BHK",
                        "/assets/properties/apartment-3.jpg"
                ),

                new PropertySeed(
                        "Jaypee Kallisto Townhome",
                        "Villa",
                        "Noida",
                        "Uttar Pradesh",
                        "Sector 128",
                        220000,
                        4,
                        4,
                        5080,
                        28.5300,
                        77.3550,
                        "Family",
                        "4.5 BHK",
                        "/assets/properties/apartment-3.jpg"
                ),

                // =========================
                // APARTMENTS
                // =========================

                new PropertySeed(
                        "Premium 2 BHK Apartment",
                        "Apartment",
                        "Noida",
                        "Uttar Pradesh",
                        "Sector 62",
                        20000,
                        2,
                        2,
                        1100,
                        28.6277,
                        77.3733,
                        "Family",
                        "2 BHK",
                        "/assets/properties/apartment-1.jpg"
                ),

                new PropertySeed(
                        "Metro Studio Residence",
                        "Studio",
                        "Delhi",
                        "Delhi",
                        "Laxmi Nagar",
                        14500,
                        1,
                        1,
                        450,
                        28.6300,
                        77.2772,
                        "Students",
                        "Studio",
                        "/assets/properties/studio-1.jpg"
                ),

                new PropertySeed(
                        "Noida Sector 137 Apartment",
                        "Apartment",
                        "Noida",
                        "Uttar Pradesh",
                        "Sector 137",
                        18000,
                        2,
                        2,
                        1050,
                        28.5100,
                        77.3910,
                        "Family",
                        "2 BHK",
                        "/assets/properties/apartment-1.jpg"
                ),

                new PropertySeed(
                        "Sector 75 Family Apartment",
                        "Apartment",
                        "Noida",
                        "Uttar Pradesh",
                        "Sector 75",
                        22000,
                        2,
                        2,
                        1150,
                        28.5720,
                        77.3830,
                        "Family",
                        "2 BHK",
                        "/assets/properties/apartment-2.jpg"
                ),

                new PropertySeed(
                        "Sector 50 Premium Flat",
                        "Flat",
                        "Noida",
                        "Uttar Pradesh",
                        "Sector 50",
                        26000,
                        3,
                        2,
                        1450,
                        28.5710,
                        77.3650,
                        "Family",
                        "3 BHK",
                        "/assets/properties/apartment-1.jpg"
                ),

                new PropertySeed(
                        "Greater Noida West 2 BHK",
                        "Flat",
                        "Greater Noida",
                        "Uttar Pradesh",
                        "Noida Extension",
                        16000,
                        2,
                        2,
                        950,
                        28.6150,
                        77.4320,
                        "Family",
                        "2 BHK",
                        "/assets/properties/apartment-2.jpg"
                ),

                new PropertySeed(
                        "Knowledge Park Student Flat",
                        "Flat",
                        "Greater Noida",
                        "Uttar Pradesh",
                        "Knowledge Park",
                        14000,
                        2,
                        2,
                        900,
                        28.4600,
                        77.4880,
                        "Students",
                        "2 BHK Shared",
                        "/assets/properties/apartment-2.jpg"
                ),

                new PropertySeed(
                        "Delhi University Studio",
                        "Studio",
                        "Delhi",
                        "Delhi",
                        "North Delhi",
                        16000,
                        1,
                        1,
                        450,
                        28.6880,
                        77.2060,
                        "Students",
                        "Studio",
                        "/assets/properties/studio-1.jpg"
                ),

                new PropertySeed(
                        "Gurgaon Sector 17 Apartment",
                        "Apartment",
                        "Gurgaon",
                        "Haryana",
                        "Sector 17",
                        24000,
                        2,
                        2,
                        1100,
                        28.4650,
                        77.0300,
                        "Professionals",
                        "2 BHK",
                        "/assets/properties/apartment-1.jpg"
                ),

                new PropertySeed(
                        "Gurgaon Sector 46 Flat",
                        "Flat",
                        "Gurgaon",
                        "Haryana",
                        "Sector 46",
                        28000,
                        2,
                        2,
                        1200,
                        28.4430,
                        77.0690,
                        "Professionals",
                        "2 BHK",
                        "/assets/properties/apartment-2.jpg"
                ),

                new PropertySeed(
                        "Cyber City Studio",
                        "Studio",
                        "Gurgaon",
                        "Haryana",
                        "DLF Phase 3",
                        18000,
                        1,
                        1,
                        500,
                        28.4930,
                        77.0920,
                        "Professionals",
                        "Studio",
                        "/assets/properties/studio-1.jpg"
                )
        );

        int before = (int) propertyRepository.count();

        Set<String> existingTitles = propertyRepository.findAll()
                .stream()
                .map(Property::getTitle)
                .collect(Collectors.toSet());

        List<Property> newProperties = new ArrayList<>();

        for (PropertySeed p : properties) {

            if (existingTitles.contains(p.title())) {
                continue;
            }

            Property property = property(
                    p.title(),
                    p.type(),
                    p.city(),
                    p.state(),
                    p.location(),
                    p.rent(),
                    p.bedrooms(),
                    p.bathrooms(),
                    p.area(),
                    manager,
                    p.lat(),
                    p.lng(),
                    p.image(),
                    List.of(
                            "WiFi",
                            "Parking",
                            "Power Backup",
                            "Security",
                            "Water Supply"
                    )
            );

            property.setDescription(
                    "Demo marketplace listing based on publicly visible property-market information. "
                    + "Please verify current availability, pricing and ownership before making any real enquiry."
            );

            property.setFurnishing(
                    p.type().equalsIgnoreCase("PG")
                            || p.type().equalsIgnoreCase("Hostel")
                            ? "Fully Furnished"
                            : "Semi Furnished"
            );

            property.setDeposit(p.rent());

            newProperties.add(property);
        }

        if (!newProperties.isEmpty()) {
            propertyRepository.saveAll(newProperties);
        }

        /*
         * ============================================================
         * UNIVERSITIES
         * ============================================================
         */

        University galgotias = getOrCreateUniversity(
                "Galgotias University",
                "Greater Noida",
                "Uttar Pradesh",
                28.3672,
                77.5376
        );

        University sharda = getOrCreateUniversity(
                "Sharda University",
                "Greater Noida",
                "Uttar Pradesh",
                28.4720,
                77.4830
        );

        University amity = getOrCreateUniversity(
                "Amity University",
                "Noida",
                "Uttar Pradesh",
                28.5444,
                77.3347
        );

        University du = getOrCreateUniversity(
                "Delhi University",
                "New Delhi",
                "Delhi",
                28.6889,
                77.2060
        );

        /*
         * ============================================================
         * STUDENT ACCOMMODATION
         * ============================================================
         */

        seedAccommodation(
                "Campus View Hostel",
                "HOSTEL",
                galgotias,
                0.5,
                7500,
                "Triple Sharing",
                "Fully Furnished",
                true,
                true,
                true,
                true,
                "Pooja Singh",
                "+91 98140 99001",
                28.3730,
                77.5430,
                "/assets/properties/studio-2.jpg"
        );

        seedAccommodation(
                "Scholar's Nest PG",
                "PG",
                galgotias,
                1.1,
                9000,
                "Double Sharing",
                "Fully Furnished",
                true,
                true,
                true,
                true,
                "Rahul Sharma",
                "+91 98110 33445",
                28.3690,
                77.5350,
                "/assets/properties/studio-1.jpg"
        );

        seedAccommodation(
                "University View Flats",
                "FLAT",
                galgotias,
                1.8,
                14000,
                "2BHK Shared",
                "Semi Furnished",
                true,
                false,
                true,
                true,
                "Arjun Mehta",
                "+91 98120 55667",
                28.3820,
                77.5280,
                "/assets/properties/apartment-2.jpg"
        );

        seedAccommodation(
                "Sunrise Boys Hostel",
                "HOSTEL",
                amity,
                0.8,
                8000,
                "Double Sharing",
                "Fully Furnished",
                true,
                true,
                true,
                true,
                "Rajesh Kumar",
                "+91 98110 33445",
                28.5470,
                77.3350,
                "/assets/properties/apartment-3.jpg"
        );

        seedAccommodation(
                "Comfort Stay PG",
                "PG",
                du,
                1.2,
                12000,
                "Single Room",
                "Fully Furnished",
                true,
                true,
                false,
                true,
                "Sunita Devi",
                "+91 98120 55667",
                28.6900,
                77.2120,
                "/assets/properties/studio-1.jpg"
        );

        System.out.println("======================================");
        System.out.println("WAYHOME SEEDING COMPLETED");
        System.out.println("Existing properties : " + before);
        System.out.println("New properties      : " + newProperties.size());
        System.out.println("Total properties    : " + propertyRepository.count());
        System.out.println("======================================");
    }

    // ============================================================
    // USER
    // ============================================================

    private User getOrCreateUser(
            String name,
            String email,
            Role role,
            String phone
    ) {

        Optional<User> existing = userRepository.findByEmail(email);

        if (existing.isPresent()) {
            User u = existing.get();
            if (role == Role.ADMIN && u.getRole() != Role.ADMIN) {
                u.setRole(Role.ADMIN);
                return userRepository.save(u);
            }
            return u;
        }

        User user = User.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .password(passwordEncoder.encode("demo-preview"))
                .role(role)
                .status("Active")
                .build();

        return userRepository.save(user);
    }

    // ============================================================
    // UNIVERSITY
    // ============================================================

    private University getOrCreateUniversity(
            String name,
            String city,
            String state,
            double lat,
            double lng
    ) {

        List<University> universities = universityRepository.findAll();

        for (University u : universities) {
            if (u.getName().equalsIgnoreCase(name)) {
                return u;
            }
        }

        University university = university(
                name,
                city,
                state,
                lat,
                lng
        );

        return universityRepository.save(university);
    }

    // ============================================================
    // ACCOMMODATION
    // ============================================================

    private void seedAccommodation(
            String name,
            String type,
            University university,
            double distance,
            double rent,
            String room,
            String furnishing,
            boolean wifi,
            boolean food,
            boolean laundry,
            boolean security,
            String owner,
            String phone,
            double lat,
            double lng,
            String image
    ) {

        boolean exists = accommodationRepository.findAll()
                .stream()
                .anyMatch(a -> a.getName().equalsIgnoreCase(name));

        if (exists) {
            return;
        }

        StudentAccommodation accommodation =
                accommodation(
                        name,
                        type,
                        university,
                        distance,
                        rent,
                        room,
                        furnishing,
                        wifi,
                        food,
                        laundry,
                        security,
                        owner,
                        phone,
                        lat,
                        lng,
                        image
                );

        accommodationRepository.save(accommodation);
    }

    // ============================================================
    // PROPERTY
    // ============================================================

    private Property property(
            String title,
            String type,
            String city,
            String state,
            String location,
            double rent,
            int beds,
            int baths,
            double area,
            User owner,
            double lat,
            double lng,
            String image,
            List<String> facilities
    ) {

        return Property.builder()
                .title(title)
                .type(type)
                .city(city)
                .state(state)
                .location(location)
                .rentMonthly(rent)
                .listingFor("rent")
                .bedrooms(beds)
                .bathrooms(baths)
                .areaSqft(area)
                .furnishing("Semi Furnished")
                .description(
                        "Verified demo listing for the WayHome college project."
                )
                .status("APPROVED")
                .verified(true)
                .owner(owner)
                .latitude(lat)
                .longitude(lng)
                .imageUrl(image)
                .facilities(new LinkedHashSet<>(facilities))
                .build();
    }

    // ============================================================
    // UNIVERSITY BUILDER
    // ============================================================

    private University university(
            String name,
            String city,
            String state,
            double lat,
            double lng
    ) {

        return University.builder()
                .name(name)
                .city(city)
                .state(state)
                .latitude(lat)
                .longitude(lng)
                .build();
    }

    // ============================================================
    // ACCOMMODATION BUILDER
    // ============================================================

    private StudentAccommodation accommodation(
            String name,
            String type,
            University university,
            double distance,
            double rent,
            String room,
            String furnishing,
            boolean wifi,
            boolean food,
            boolean laundry,
            boolean security,
            String owner,
            String phone,
            double lat,
            double lng,
            String image
    ) {

        return StudentAccommodation.builder()
                .name(name)
                .type(type)
                .university(university)
                .distanceKm(distance)
                .rentMonthly(rent)
                .roomType(room)
                .furnishing(furnishing)
                .wifi(wifi)
                .food(food)
                .laundry(laundry)
                .security(security)
                .ownerName(owner)
                .ownerPhone(phone)
                .latitude(lat)
                .longitude(lng)
                .imageUrl(image)
                .description(
                        "Student-friendly accommodation near campus with practical facilities."
                )
                .rating(4.3)
                .reviewCount(24)
                .availableRooms(5)
                .build();
    }

    // ============================================================
    // DATA RECORD
    // ============================================================

    private record PropertySeed(
            String title,
            String type,
            String city,
            String state,
            String location,
            double rent,
            int bedrooms,
            int bathrooms,
            double area,
            double lat,
            double lng,
            String audience,
            String roomType,
            String image
    ) {
    }
}