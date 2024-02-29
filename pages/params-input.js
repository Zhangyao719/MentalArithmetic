export default Vue.extend({
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
             if (!/^[\d;]*$/.test(value)) return callback('只允许有数字和英文分号');
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