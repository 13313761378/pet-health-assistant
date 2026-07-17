package com.pethealth.assistant.pet;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pethealth.assistant.api.GlobalExceptionHandler;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class PetControllerTests {
    private PetService petService;
    private MockMvc mockMvc;
    private UsernamePasswordAuthenticationToken authentication;

    @BeforeEach
    void setUp() {
        petService = mock(PetService.class);
        authentication = new UsernamePasswordAuthenticationToken("7", null);
        mockMvc = MockMvcBuilders.standaloneSetup(new PetController(petService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void listsPetsForAuthenticatedUser() throws Exception {
        when(petService.list(7L)).thenReturn(List.of(new PetResponse(3L, 2L, "小橘", "CAT", "橘猫", "MALE",
                LocalDate.of(2025, 1, 1), null, null, null, 100, null, null)));

        mockMvc.perform(get("/api/pets").principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("小橘"));
    }

    @Test
    void createsPetWithValidatedPayload() throws Exception {
        when(petService.create(eq(7L), any())).thenReturn(new PetResponse(3L, 2L, "小橘", "CAT", "橘猫", "MALE",
                LocalDate.of(2025, 1, 1), null, null, null, 100, null, null));

        mockMvc.perform(post("/api/pets").principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"小橘","species":"CAT","breed":"橘猫","gender":"MALE","birthDate":"2025-01-01"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(3))
                .andExpect(jsonPath("$.healthScore").value(100));
    }

    @Test
    void rejectsInvalidPetPayload() throws Exception {
        mockMvc.perform(post("/api/pets").principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"species\":\"BIRD\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").value("宠物名称不能为空"))
                .andExpect(jsonPath("$.fieldErrors.species").value("宠物类型不正确"));
    }

    @Test
    void deletesPetForAuthenticatedUser() throws Exception {
        mockMvc.perform(delete("/api/pets/3").principal(authentication))
                .andExpect(status().isNoContent());
        verify(petService).delete(7L, 3L);
    }
}
