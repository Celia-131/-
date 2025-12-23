"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      remindOn: true,
      vibrateOn: true,
      target: {
        id: "sphngWDDQ2XkSEQ",
        linkId: "sphngWDDQ2XkSEQ",
        name: "不累乐园STAYLand",
        avatar: "/static/avatar_stayland.png"
      },
      creators: [],
      pollTimer: null,
      pollInterval: 15e3,
      // 15s 默认轮询
      apiBase: "https://example.com/api"
      // TODO: 替换为真实后端地址
    };
  },
  onShow() {
    this.startPolling();
  },
  onHide() {
    this.stopPolling();
  },
  onUnload() {
    this.stopPolling();
  },
  methods: {
    onRemindToggle(e) {
      this.remindOn = e.detail.value;
    },
    onVibrateToggle(e) {
      this.vibrateOn = e.detail.value;
    },
    onAddTarget() {
      if (this.creators.find((c) => c.id === this.target.id)) {
        common_vendor.index.showToast({ title: "已关注", icon: "none" });
        return;
      }
      const newCreator = {
        ...this.target,
        status: "idle",
        lastLiveTime: ""
      };
      this.creators = [newCreator, ...this.creators];
      common_vendor.index.showToast({ title: "添加成功", icon: "success" });
    },
    // 模拟开播提醒；真实业务应由服务端推送或轮询
    onNotifyPreview(e) {
      const targetId = e.currentTarget.dataset.id;
      const creator = this.creators.find((c) => c.id === targetId);
      if (!creator)
        return;
      if (this.remindOn) {
        common_vendor.index.showToast({ title: `${creator.name} 开播啦`, icon: "none" });
      }
      if (this.remindOn && this.vibrateOn && common_vendor.index.vibrateShort) {
        common_vendor.index.vibrateShort({ type: "light" });
      }
      creator.status = "live";
      creator.lastLiveTime = "刚刚";
      this.creators = [...this.creators];
    },
    // ====== 实时轮询开播状态（需替换 apiBase 为真实接口） ======
    startPolling() {
      if (this.pollTimer)
        return;
      this.pollTimer = setInterval(this.checkLiveStatus, this.pollInterval);
      this.checkLiveStatus();
    },
    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    },
    async checkLiveStatus() {
      if (!this.creators.length)
        return;
      try {
        const { data, statusCode } = await common_vendor.index.request({
          url: `${this.apiBase}/live-status`,
          method: "GET",
          data: { ids: this.creators.map((c) => c.id).join(",") }
        });
        if (statusCode !== 200 || !data || !data.list)
          return;
        const liveMap = /* @__PURE__ */ new Map();
        data.list.forEach((item) => {
          liveMap.set(item.id, item.status);
        });
        let updated = false;
        this.creators = this.creators.map((c) => {
          const s = liveMap.get(c.id) || c.status;
          if (s !== c.status) {
            updated = true;
            if (s === "live" && this.remindOn) {
              common_vendor.index.showToast({ title: `${c.name} 开播啦`, icon: "none" });
              if (this.vibrateOn && common_vendor.index.vibrateShort) {
                common_vendor.index.vibrateShort({ type: "light" });
              }
            }
          }
          return {
            ...c,
            status: s,
            lastLiveTime: s === "live" ? "刚刚" : c.lastLiveTime
          };
        });
        if (updated) {
          this.creators = [...this.creators];
        }
      } catch (err) {
        common_vendor.index.__f__("warn", "at pages/index/index.vue:165", "live status check failed", err);
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.target.avatar,
    b: common_vendor.t($data.target.name),
    c: $data.remindOn,
    d: common_vendor.o((...args) => $options.onRemindToggle && $options.onRemindToggle(...args)),
    e: $data.vibrateOn,
    f: common_vendor.o((...args) => $options.onVibrateToggle && $options.onVibrateToggle(...args)),
    g: common_vendor.o((...args) => $options.onAddTarget && $options.onAddTarget(...args)),
    h: common_vendor.t($data.creators.length),
    i: $data.creators.length
  }, $data.creators.length ? {
    j: common_vendor.f($data.creators, (item, k0, i0) => {
      return common_vendor.e({
        a: item.avatar,
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.status === "live" ? "直播中" : "未开播"),
        d: item.lastLiveTime
      }, item.lastLiveTime ? {
        e: common_vendor.t(item.lastLiveTime)
      } : {}, {
        f: item.id,
        g: common_vendor.o((...args) => $options.onNotifyPreview && $options.onNotifyPreview(...args), item.id),
        h: item.id
      });
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
