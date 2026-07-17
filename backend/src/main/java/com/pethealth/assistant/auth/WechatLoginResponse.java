package com.pethealth.assistant.auth;

public record WechatLoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        UserView user) {

    public record UserView(Long id, String nickname, String avatarUrl) {
    }
}
