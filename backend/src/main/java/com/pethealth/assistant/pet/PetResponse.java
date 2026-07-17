package com.pethealth.assistant.pet;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PetResponse(Long id, Long familyId, String name, String species, String breed, String gender,
        LocalDate birthDate, BigDecimal weight, String avatarUrl, String hobbies, Integer healthScore,
        LocalDateTime createdAt, LocalDateTime updatedAt) {
    static PetResponse from(Pet pet) {
        return new PetResponse(pet.getId(), pet.getFamilyId(), pet.getName(), pet.getSpecies(), pet.getBreed(),
                pet.getGender(), pet.getBirthDate(), pet.getWeight(), pet.getAvatarObjectKey(), pet.getHobbies(),
                pet.getHealthScore(), pet.getCreatedAt(), pet.getUpdatedAt());
    }
}
