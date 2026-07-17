package com.pethealth.assistant.pet;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.pethealth.assistant.family.FamilyGroup;
import com.pethealth.assistant.family.FamilyGroupMapper;
import com.pethealth.assistant.family.FamilyMember;
import com.pethealth.assistant.family.FamilyMemberMapper;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PetService {
    private final PetMapper petMapper;
    private final FamilyGroupMapper familyGroupMapper;
    private final FamilyMemberMapper familyMemberMapper;

    public PetService(PetMapper petMapper, FamilyGroupMapper familyGroupMapper, FamilyMemberMapper familyMemberMapper) {
        this.petMapper = petMapper;
        this.familyGroupMapper = familyGroupMapper;
        this.familyMemberMapper = familyMemberMapper;
    }

    public List<PetResponse> list(long userId) {
        List<Long> familyIds = activeMemberships(userId).stream().map(FamilyMember::getFamilyId).toList();
        if (familyIds.isEmpty()) return List.of();
        return petMapper.selectList(Wrappers.<Pet>lambdaQuery()
                        .in(Pet::getFamilyId, familyIds)
                        .orderByAsc(Pet::getCreatedAt, Pet::getId))
                .stream().map(PetResponse::from).toList();
    }

    @Transactional
    public PetResponse create(long userId, PetRequest request) {
        Long familyId = resolveOrCreateFamily(userId);
        ensureUniqueName(familyId, request.name(), null);
        Pet pet = new Pet();
        pet.setFamilyId(familyId);
        pet.setCreatedBy(userId);
        apply(pet, request);
        pet.setHealthScore(100);
        pet.setDeleted(0);
        petMapper.insert(pet);
        return PetResponse.from(petMapper.selectById(pet.getId()));
    }

    @Transactional
    public PetResponse update(long userId, long petId, PetRequest request) {
        Pet pet = requireAccessiblePet(userId, petId);
        ensureUniqueName(pet.getFamilyId(), request.name(), petId);
        apply(pet, request);
        petMapper.updateById(pet);
        return PetResponse.from(petMapper.selectById(petId));
    }

    @Transactional
    public void delete(long userId, long petId) {
        requireAccessiblePet(userId, petId);
        petMapper.deleteById(petId);
    }

    private List<FamilyMember> activeMemberships(long userId) {
        return familyMemberMapper.selectList(Wrappers.<FamilyMember>lambdaQuery()
                .eq(FamilyMember::getUserId, userId)
                .eq(FamilyMember::getStatus, "ACTIVE")
                .orderByAsc(FamilyMember::getJoinedAt, FamilyMember::getId));
    }

    private Long resolveOrCreateFamily(long userId) {
        List<FamilyMember> memberships = activeMemberships(userId);
        if (!memberships.isEmpty()) return memberships.getFirst().getFamilyId();

        FamilyGroup family = new FamilyGroup();
        family.setName("我的家庭");
        family.setOwnerUserId(userId);
        family.setInviteCode(UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase());
        family.setDeleted(0);
        familyGroupMapper.insert(family);

        FamilyMember member = new FamilyMember();
        member.setFamilyId(family.getId());
        member.setUserId(userId);
        member.setRole("OWNER");
        member.setStatus("ACTIVE");
        familyMemberMapper.insert(member);
        return family.getId();
    }

    private Pet requireAccessiblePet(long userId, long petId) {
        Pet pet = petMapper.selectById(petId);
        if (pet == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "宠物不存在");
        Long count = familyMemberMapper.selectCount(Wrappers.<FamilyMember>lambdaQuery()
                .eq(FamilyMember::getUserId, userId)
                .eq(FamilyMember::getFamilyId, pet.getFamilyId())
                .eq(FamilyMember::getStatus, "ACTIVE"));
        if (count == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "宠物不存在");
        return pet;
    }

    private void ensureUniqueName(Long familyId, String name, Long excludedPetId) {
        var query = Wrappers.<Pet>lambdaQuery().eq(Pet::getFamilyId, familyId).eq(Pet::getName, name.trim());
        if (excludedPetId != null) query.ne(Pet::getId, excludedPetId);
        if (petMapper.selectCount(query) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "家庭中已存在同名宠物");
        }
    }

    private void apply(Pet pet, PetRequest request) {
        pet.setName(request.name().trim());
        pet.setSpecies(request.species());
        pet.setBreed(request.breed() == null ? null : request.breed().trim());
        pet.setGender(request.gender() == null ? "UNKNOWN" : request.gender());
        pet.setBirthDate(request.birthDate());
        pet.setWeight(request.weight());
        pet.setAvatarObjectKey(request.avatarUrl());
        pet.setHobbies(request.hobbies() == null ? null : request.hobbies().trim());
    }
}
