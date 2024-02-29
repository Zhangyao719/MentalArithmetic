export default Vue.extend({
  template: `
      <div class="exams">

          <div :class="['start', { disappear: duration > 2.9 }]">
            <h1>心算障碍赛</h1>
            <p>准备答题!</p>
            <span>{{ countdown }}</span>
          </div>

          <video
            :class="['video', { disappear: duration < 3 || times > params.length}]"
            autoplay="autoplay"
            loop="loop"
            preload="auto"
            muted="muted"
            width="100%"
            height="100%"
          >
            <source src="../assets/background.mp4" type="video/mp4">
            您的浏览器暂不支持H5视频播放, 推荐下载谷歌或火狐浏览器。
          </video>
          <div :class="['randomNums', { disappear: duration < 3 || times > params.length}]">
            <ul class="content" />
          </div>

          <div :class="['end', {
              disappear: duration < 3 || times <= params.length || duration >= (13 + params.length)
            }]"
          >
            <h1>请作答</h1>
            <a-button @click="duration += 10">
              查看结果
              <a-icon type="forward" />
            </a-button>
          </div>

          <div :class="['answer', { disappear: duration < (13 + params.length) }]">
            <h2>正确答案</h2>
            <h1>{{ result }}</h1>
          </div>

      </div>
  `,

  data() {
    return {
      params: [],
      result: '',
      countdown: 3,
      duration: 0, // 经历的总时长
      timeId: null,
      times: 1, // 参数出现次数(从1(第二个)开始, 0一开始就创建了)
    }
  },

  created() {
    const { params, result } = JSON.parse(sessionStorage.getItem('expression'))
    this.params = params
    this.result = result
    this.init()
  },

  mounted() {
    const numsContainer = document.querySelector('.randomNums')
    this.resize(numsContainer)
    this.createNum(numsContainer.children[0], 'append', this.params[0])
    window.addEventListener('resize', this.resize(numsContainer))
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.resize);
  },

  watch: {
    duration(v) {
      if (v === 3 ) {
        clearTimeout(this.timeId)

        // 开始动态显示数字
        const ul = document.querySelector('ul')
        this.timeId = setInterval(() => {
          if (this.times === this.params.length) {
            this.duration += this.times
            this.times ++ // 为了 this.times > params.length 结束video
            return clearInterval(this.timeId)
          }
          this.createNum(ul, 'replace', this.params[this.times], ul.children[0])
          this.times++
        }, 1000);
      }
      if (v === 3 + this.params.length) {
        this.timeId = setTimeout(() => {
          this.duration += 10
          clearTimeout(this.timeId)
          this.timeId = null
        }, 10000)
      }
    }
  },

  methods: {
    init() {
      // 倒计时
      const id = setInterval(() => {
        if (this.countdown === 0) {
          clearInterval(id);
        } else {
          this.countdown --
        }
      }, 1000);

      // 时间到
      this.timeId = setTimeout(() => {
        this.duration = 3
      }, 3000);
    },

    resize(dom) {
      dom.style.width = window.innerHeight * (1550 / 870) + 'px'
    },

    // 动态 创建/替换 数字元素
    createNum(parentNode, action, inner, prevDom) {
      const li = document.createElement('li')
      li.innerText = inner
      this.randomDom(li, 100, 50, parentNode)
      action === 'append'
        ? parentNode.appendChild(li)
        : parentNode.replaceChild(li, prevDom)
    },

    // 设置随机位置
    randomDom(ele, elemWidth, elemHeight, parentNode) {
      // 1.创建随机位置
      const point = this.randomPosition(elemWidth, elemHeight, parentNode)

      // 2.修改ele定位
      this.cloneObj(ele.style, {
        left: point.left,
        top: point.top,
      })
    },

    randomPosition(elemWidth, elemHeight, parentNode) {
      //父级宽度减去elemWidth 的随机与左面的距离
      const left = Math.random() * (parentNode.clientWidth - elemWidth) + 'px'
      //父级高度减去elemHeight 的随机与上面的距离
      const top = Math.random() * (parentNode.clientHeight - elemHeight) + 'px'

      return { left, top }
    },

    cloneObj(target, source) {
      for (let key in source) {
        target[key] = source[key]
      }
    }
  }
})
