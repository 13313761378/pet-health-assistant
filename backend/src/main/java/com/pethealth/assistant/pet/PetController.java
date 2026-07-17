package com.pethealth.assistant.pet;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pets")
public class PetController {
    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    @GetMapping
    public List<PetResponse> list(Authentication authentication) {
        return petService.list(userId(authentication));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PetResponse create(Authentication authentication, @Valid @RequestBody PetRequest request) {
        return petService.create(userId(authentication), request);
    }

    @PutMapping("/{petId}")
    public PetResponse update(Authentication authentication, @PathVariable long petId,
            @Valid @RequestBody PetRequest request) {
        return petService.update(userId(authentication), petId, request);
    }

    @DeleteMapping("/{petId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Authentication authentication, @PathVariable long petId) {
        petService.delete(userId(authentication), petId);
    }

    private long userId(Authentication authentication) {
        try {
            return Long.parseLong(authentication.getName());
        } catch (RuntimeException exception) {
            throw new IllegalStateException("登录用户标识无效", exception);
        }
    }
}
