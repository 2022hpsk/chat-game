import { _decorator, Component, Node, Label, EditBox, Button, instantiate, Prefab, ScrollView } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MainController')
export class MainController extends Component {
    @property(EditBox)
    userInputBox: EditBox = null; // 用户输入框

    @property(Button)
    submitButton: Button = null; // 提交按钮

    @property(Node)
    dialogueContainer: Node = null; // 对话内容的容器

    @property(Prefab)
    dialogueItemPrefab: Prefab = null; // 对话内容的预制体

    start() {
        // 初始化按钮事件
        this.submitButton.node.on('click', this.onSubmit, this);
    }

    // 提交事件
    async onSubmit() {
        const userInput = this.userInputBox.string.trim();
        if (!userInput) {
            this.addDialogueItem("系统提示", "请输入内容！");
            return;
        }

        // 显示用户提问
        this.addDialogueItem("你", userInput);
        this.userInputBox.string = ""; // 清空输入框

        // 向后端请求
        const aiResponse = await this.getAIResponse(userInput);
        this.addDialogueItem("AI", aiResponse);
    }

    // 添加对话项到容器中
    addDialogueItem(speaker: string, message: string) {
        // 检查预制体是否赋值
        if (!this.dialogueItemPrefab) {
            console.error("DialogueItem prefab is not assigned!");
            return;
        }
    
        // 实例化预制体
        const dialogueItem = instantiate(this.dialogueItemPrefab);
    
        // 获取子节点和组件
        const speakerNode = dialogueItem.getChildByName("Speaker");
        const messageNode = dialogueItem.getChildByName("Message");
    
        if (!speakerNode || !messageNode) {
            console.error("DialogueItem prefab structure is incorrect! 'Speaker' or 'Message' node is missing.");
            return;
        }
    
        // 确保子节点有 Label 组件
        const speakerLabel = speakerNode.getComponent(Label);
        const messageLabel = messageNode.getComponent(Label);
    
        if (!speakerLabel || !messageLabel) {
            console.error("Label component is missing on 'Speaker' or 'Message' node.");
            return;
        }
    
        // 设置内容
        speakerLabel.string = `${speaker}:`;
        messageLabel.string = message;
    
        // 检查对话容器是否赋值
        if (!this.dialogueContainer) {
            console.error("DialogueContainer is not assigned!");
            return;
        }
    
        // 将对话项添加到容器
        this.dialogueContainer.addChild(dialogueItem);
    
        // 滚动到最新
        const scrollView = this.dialogueContainer.parent.getComponent(ScrollView);
        if (!scrollView) {
            console.error("ScrollView component is missing on DialogueContainer's parent.");
            return;
        }
    
        scrollView.scrollToBottom(0.3);
    }
    

    // 后端请求
    async getAIResponse(input: string): Promise<string> {
        try {
            const response = await fetch('http://your-backend-api.com/ai-response', {
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
            return "请求失败，请稍后再试。";
        }
    }
}
