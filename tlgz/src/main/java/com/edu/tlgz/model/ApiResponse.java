package com.edu.tlgz.model;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ApiResponse {
    // 状态码：200成功，500失败
    private int code;
    // 提示信息
    private String message;
    // 核心数据：直播状态列表
    private List<LiveStatus> list;
}
