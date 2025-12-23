package com.edu.tlgz.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data// 自动生成全参构造器
@AllArgsConstructor
public class LiveStatus {
    // 直播ID
    private String id;
    // 直播状态：live（直播中）/idle（未开播）
    private String status;
}
