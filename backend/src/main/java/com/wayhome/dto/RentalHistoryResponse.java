package com.wayhome.dto;

import com.wayhome.model.Agreement;
import com.wayhome.model.Application;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RentalHistoryResponse {
    private List<Agreement> activeAgreements;
    private List<Agreement> pastAgreements;
    private List<Application> applicationHistory;
}