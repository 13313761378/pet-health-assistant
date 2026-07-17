package com.pethealth.assistant.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

public record WechatSession(
        String openid,
        @JsonProperty("session_key") String sessionKey,
        String unionid,
        Integer errcode,
        String errmsg) {

    public boolean succeeded() {
        return errcode == null && openid != null && !openid.isBlank();
    }
}
