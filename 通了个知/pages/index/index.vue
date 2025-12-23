<template>
  <view class="page">
    <view class="header">
      <text class="title">不累乐园 STAYLand</text>
      <text class="subtitle">开播提醒与震动提醒</text>
    </view>

    <view class="card">
      <view class="creator-info main">
        <image class="avatar lg" :src="target.avatar" mode="aspectFill" />
        <view>
          <text class="creator-name">{{ target.name }}</text>
          <text class="creator-meta">官方视频号 · 开播立刻通知</text>
        </view>
      </view>
      <view class="row">
        <text class="label">开播提醒</text>
        <switch :checked="remindOn" color="#8b7bff" @change="onRemindToggle" />
      </view>
      <view class="row">
        <text class="label">开播震动</text>
        <switch :checked="vibrateOn" color="#8b7bff" @change="onVibrateToggle" />
      </view>
      <button class="primary" @click="onAddTarget">关注并开启提醒</button>
    </view>

    <view class="card list-card">
      <view class="row space-between">
        <text class="label">提醒列表</text>
        <text class="count">{{ creators.length }} 位</text>
      </view>
      <block v-if="creators.length">
        <view class="creator-item" v-for="item in creators" :key="item.id">
          <view class="creator-info">
            <image class="avatar" :src="item.avatar" mode="aspectFill" />
            <view>
              <text class="creator-name">{{ item.name }}</text>
              <text class="creator-meta">
                {{ item.status === 'live' ? '直播中' : '未开播' }}
                <text v-if="item.lastLiveTime"> · 上次 {{ item.lastLiveTime }}</text>
              </text>
            </view>
          </view>
          <button class="ghost" size="mini" :data-id="item.id" @click="onNotifyPreview">模拟开播</button>
        </view>
      </block>
      <view v-else class="empty">尚未关注，点击上方按钮即可添加</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      remindOn: true,
      vibrateOn: true,
      target: {
        id: 'sphngWDDQ2XkSEQ',
        linkId: 'sphngWDDQ2XkSEQ',
        name: '不累乐园STAYLand',
        avatar: '/static/avatar_stayland.png'
      },
      creators: [],
      pollTimer: null,
      pollInterval: 15000, // 15s 默认轮询
      apiBase: 'https://example.com/api' // TODO: 替换为真实后端地址
    }
  },
  onShow() {
    this.startPolling()
  },
  onHide() {
    this.stopPolling()
  },
  onUnload() {
    this.stopPolling()
  },
  methods: {
    onRemindToggle(e) {
      this.remindOn = e.detail.value
    },
    onVibrateToggle(e) {
      this.vibrateOn = e.detail.value
    },
    onAddTarget() {
      if (this.creators.find(c => c.id === this.target.id)) {
        uni.showToast({ title: '已关注', icon: 'none' })
        return
      }
      const newCreator = {
        ...this.target,
        status: 'idle',
        lastLiveTime: ''
      }
      this.creators = [newCreator, ...this.creators]
      uni.showToast({ title: '添加成功', icon: 'success' })
    },
    // 模拟开播提醒；真实业务应由服务端推送或轮询
    onNotifyPreview(e) {
      const targetId = e.currentTarget.dataset.id
      const creator = this.creators.find(c => c.id === targetId)
      if (!creator) return
      if (this.remindOn) {
        uni.showToast({ title: `${creator.name} 开播啦`, icon: 'none' })
      }
      if (this.remindOn && this.vibrateOn && uni.vibrateShort) {
        uni.vibrateShort({ type: 'light' })
      }
      creator.status = 'live'
      creator.lastLiveTime = '刚刚'
      this.creators = [...this.creators]
    },
    // ====== 实时轮询开播状态（需替换 apiBase 为真实接口） ======
    startPolling() {
      if (this.pollTimer) return
      this.pollTimer = setInterval(this.checkLiveStatus, this.pollInterval)
      // 首次立即触发一次
      this.checkLiveStatus()
    },
    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
      }
    },
    async checkLiveStatus() {
      // 若未关注则跳过
      if (!this.creators.length) return
      try {
        const { data, statusCode } = await uni.request({
          url: `${this.apiBase}/live-status`,
          method: 'GET',
          data: { ids: this.creators.map(c => c.id).join(',') }
        })
        if (statusCode !== 200 || !data || !data.list) return
        const liveMap = new Map()
        data.list.forEach(item => {
          liveMap.set(item.id, item.status) // status: 'live' | 'idle'
        })
        let updated = false
        this.creators = this.creators.map(c => {
          const s = liveMap.get(c.id) || c.status
          if (s !== c.status) {
            updated = true
            // 触发提醒
            if (s === 'live' && this.remindOn) {
              uni.showToast({ title: `${c.name} 开播啦`, icon: 'none' })
              if (this.vibrateOn && uni.vibrateShort) {
                uni.vibrateShort({ type: 'light' })
              }
            }
          }
          return {
            ...c,
            status: s,
            lastLiveTime: s === 'live' ? '刚刚' : c.lastLiveTime
          }
        })
        if (updated) {
          this.creators = [...this.creators]
        }
      } catch (err) {
        // 静默失败，不打扰用户
        console.warn('live status check failed', err)
      }
    }
  }
}
</script>

<style>
page {
  background: #f2ecff;
  color: #2f2f2f;
}

.page {
  padding: 24rpx 28rpx 48rpx;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial;
}

.header {
  margin-bottom: 24rpx;
}
.title {
  font-size: 36rpx;
  font-weight: 700;
}
.subtitle {
  margin-top: 8rpx;
  color: #6b6780;
  font-size: 26rpx;
}

.card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 28rpx rgba(63, 46, 140, 0.08);
  margin-bottom: 24rpx;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12rpx 0;
}

.label {
  color: #534f63;
  font-size: 26rpx;
}

.primary {
  margin-top: 16rpx;
  background: linear-gradient(135deg, #8b7bff, #a08cff);
  color: #fff;
  border: none;
  border-radius: 12rpx;
  padding: 22rpx;
  font-size: 30rpx;
}

.list-card .count {
  color: #8b7bff;
}

.creator-item {
  padding: 18rpx 0;
  border-bottom: 1px solid #f0ebff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}
.creator-item:last-child {
  border-bottom: none;
}

.creator-info {
  display: flex;
  gap: 16rpx;
  align-items: center;
}
.creator-info.main {
  margin-bottom: 12rpx;
}
.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #f0ebff;
}
.avatar.lg {
  width: 96rpx;
  height: 96rpx;
}
.creator-name {
  font-size: 30rpx;
  font-weight: 600;
}
.creator-meta {
  display: block;
  color: #7a7690;
  font-size: 24rpx;
  margin-top: 4rpx;
}

.ghost {
  background: #f6f3ff;
  color: #6656d6;
  border: 1px solid #e4ddff;
  border-radius: 10rpx;
}

.empty {
  text-align: center;
  color: #7a7690;
  padding: 24rpx 0;
  font-size: 26rpx;
}
</style>
