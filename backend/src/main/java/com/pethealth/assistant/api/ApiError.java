package com.pethealth.assistant.api;

import java.time.Instant;
import java.util.Map;

public record ApiError(int code, String message, Instant timestamp, Map<String, String> fieldErrors) {

    public static ApiError of(int code, String message) {
        return new ApiError(code, message, Instant.now(), null);
    }
}
