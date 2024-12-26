import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('BackendManager')
export class BackendManager extends Component {
    private baseUrl: string = 'http://101.126.129.236:3000'; // 后端地址

    // 获取 AI 响应
    async getAIResponse(input: string): Promise<string> {
        const url=this.baseUrl+'/api/conversation'
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: input }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data.reply || "AI无回复";
        } catch (error) {
            console.error('Error fetching AI response:', error);
            return "请求失败。";
        }
    }
}
