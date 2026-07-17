package com.pethealth.assistant.pet;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PetRequest(
        @NotBlank(message = "宠物名称不能为空") @Size(max = 64, message = "宠物名称不能超过64个字符") String name,
        @NotBlank(message = "宠物类型不能为空") @Pattern(regexp = "DOG|CAT|OTHER", message = "宠物类型不正确") String species,
        @Size(max = 100, message = "宠物品种不能超过100个字符") String breed,
        @Pattern(regexp = "MALE|FEMALE|UNKNOWN", message = "宠物性别不正确") String gender,
        @PastOrPresent(message = "出生日期不能晚于今天") LocalDate birthDate,
        @DecimalMin(value = "0.01", message = "宠物体重必须大于0") BigDecimal weight,
        @Size(max = 512, message = "头像地址不能超过512个字符") String avatarUrl,
        @Size(max = 500, message = "爱好不能超过500个字符") String hobbies) {
}
