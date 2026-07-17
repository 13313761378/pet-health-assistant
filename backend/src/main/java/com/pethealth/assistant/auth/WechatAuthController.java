package com.pethealth.assistant.auth;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class WechatAuthController {

    private final WechatAuthService authService;

    public WechatAuthController(WechatAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/wechat")
    public WechatLoginResponse login(@Valid @RequestBody WechatLoginRequest request) {
        return authService.login(request);
    }
}
