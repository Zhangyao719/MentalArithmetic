const paramsInput = Vue.component('params-input', {
  template: `
      <div class="container">
          <div class="content">
              <h2 style="text-align: center; margin: 30px 0;">心算参数输入</h2>
              <a-form
                  layout="horizontal"
                  :form="form"
                  :label-col="{span: 4}"
                  :wrapper-col="{span: 10}"
              >
                  <a-form-item label="输入参数" style="position: relative;">
                      <a-input
                          v-decorator="[
                              'params',
                              { rules: [
                                      { required: true, message: '请输入参数'},
                                      { validator: checkInput },
                                  ]
                              }
                          ]"
                          allow-clear
                      />
                      <span style="position: absolute; right: -145px">
                          (多个参数以 " ; " 隔开)
                      </span>
                  </a-form-item>
                  <a-form-item label="输入结果" :wrapper-col="{span: 4}">
                      <a-input-password
                          v-decorator="[
                              'result',
                              { rules: [{ required: true, message: '请输入结果'}]}
                          ]"
                      />
                  </a-form-item>
              </a-form>
              <a-row type="flex">
                  <a-col :offset="4">
                      <a-button type="danger" @click="form.resetFields()">重置</a-button>
                  </a-col>
                  <a-col :offset="2"><a-button type="primary" @click="submit">开始</a-button></a-col>
              </a-row> 
          </div>
      </div>
   `,
   data() {
      return {
          form: this.$form.createForm(this),
      }
  },
   methods: {
       checkInput(_, value, callback) {
          //  if (!/^[\d;]*$/.test(value)) return callback('只允许有数字和英文分号');
           if (!/^[(\-|\+|\.)?\d;]*$/.test(value)) return callback('只允许有正数、负数、小数和英文分号');
           
           callback();
       },
       submit() {
          this.form.validateFields((err, values) => {
              if (!err) {
                  let { params } = values;
                  params = params.split(';');
                  sessionStorage.setItem('expression', JSON.stringify({
                      ...values,
                      params,
                  }))
                  this.$router.push({name: 'exams'})
              }
          });
       }
   },
})

const exams = Vue.component('exams',{
  template: `
      <div class="exams">

          <div :class="['start', { disappear: duration > 2.9 }]">
            <h1>心算障碍赛</h1>
            <p>准备答题!</p>
            <span>{{ countdown }}</span>
          </div>

          <video
            :class="['video', { disappear: duration < 3 || times > params.length}]"
            autoplay
            loop
            preload="auto"
            muted
            playsinline
            webkit-playsinline
            x-webkit-airplay="true"
            x5-video-player-type="h5"
            x5-video-orientation="landscape"
            x5-playsinline
            x5-video-player-fullscreen="false"
            >
            <source src="assets/background.mp4" type="video/mp4">
            您的浏览器暂不支持H5视频播放, 推荐下载谷歌或火狐浏览器。
          </video>
          <ul :class="['randomNums', { disappear: duration < 3 || times > params.length}]" />

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
    const numsContainer = document.querySelector('ul')
    this.createNum(numsContainer, 'append', this.params[0])
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

    // 动态 创建/替换 数字元素
    createNum(parentNode, action, inner, prevDom) {
      const li = document.createElement('li')
      li.innerText = inner

      action === 'append'
        ? parentNode.appendChild(li)
        : parentNode.replaceChild(li, prevDom)

      const ele = document.querySelector('li')
      const eleWidth = ele && ele.offsetWidth || 100
      const eleHeight = ele && ele.offsetHeight || 100
      this.randomDom(li, eleWidth, eleHeight)

    },

    // 设置随机位置
    randomDom(ele, elemWidth, elemHeight) {
      // 1.创建随机位置
      const point = this.randomPosition(elemWidth, elemHeight)

      // 2.修改ele定位
      this.cloneObj(ele.style, {
        left: point.left,
        top: point.top,
      })
    },

    randomPosition(elemWidth, elemHeight) {
      //父级宽度减去elemWidth 的随机与左面的距离
      const left = Math.random() * (window.innerWidth - elemWidth || 200) + 'px'
      //父级高度减去elemHeight 的随机与上面的距离
      const top = Math.random() * (window.innerHeight - elemHeight || 200) + 'px'

      return { left, top }
    },

    cloneObj(target, source) {
      for (let key in source) {
        target[key] = source[key]
      }
    }
  }
})

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: 'set',
      component: paramsInput,
    },
    {
      path: '/exams',
      name: 'exams',
      component: exams,
    }
  ]
})

// 配置VueRouter跳转自身路由报错的问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

const vm = new Vue({
    el: '#app',
    router,
    data: {
        message: 'Hello Vue!'
    }
})