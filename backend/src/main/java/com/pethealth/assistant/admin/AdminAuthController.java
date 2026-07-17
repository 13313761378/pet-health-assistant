package com.pethealth.assistant.admin;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.security.Principal;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/admin/auth")
public class AdminAuthController {
    private final AdminAuthService service;
    public AdminAuthController(AdminAuthService service){this.service=service;}
    @PostMapping("/login") public AdminAuthService.LoginResponse login(@Valid @RequestBody LoginRequest r){return service.login(r.username(),r.password());}
    @GetMapping("/me") public AdminAuthService.AdminProfile me(Principal p){return service.profile(adminId(p));}
    static Long adminId(Principal p){return Long.valueOf(p.getName().substring("admin:".length()));}
    public record LoginRequest(@NotBlank String username,@NotBlank String password){}
}
