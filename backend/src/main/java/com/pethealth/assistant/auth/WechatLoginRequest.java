package com.pethealth.assistant.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WechatLoginRequest(
        @NotBlank(message = "微信登录 code 不能为空") String code,
        @Size(max = 64, message = "昵称不能超过 64 个字符") String nickname,
        @Size(max = 512, message = "头像地址不能超过 512 个字符") String avatarUrl) {
}
