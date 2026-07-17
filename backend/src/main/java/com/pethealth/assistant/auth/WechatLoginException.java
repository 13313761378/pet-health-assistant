package com.pethealth.assistant.auth;

import org.springframework.http.HttpStatus;

public class WechatLoginException extends RuntimeException {

    private final HttpStatus status;

    public WechatLoginException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public WechatLoginException(HttpStatus status, String message, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    public HttpStatus status() {
        return status;
    }
}
