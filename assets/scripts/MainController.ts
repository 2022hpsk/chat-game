import { _decorator, Component, Node, Label, EditBox, Button, instantiate, Prefab, ScrollView } from 'cc';
import { BackendManager } from './BackendController';

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

    @property(BackendManager)
    backendManager: BackendManager = null; // 绑定 BackendManager 脚本

    // private backendManager: BackendManager;

    onLoad() {
        // 初始化 BackendManager
        this.backendManager = this.getComponent(BackendManager);
        if (!this.backendManager) {
            console.error('BackendManager component is missing on this node.');
        }

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

        // 使用 BackendManager 获取 AI 响应
        if (!this.backendManager) {
            this.addDialogueItem("系统提示", "后端管理器未初始化！");
            return;
        }

        const aiResponse = await this.backendManager.getAIResponse(userInput);
        this.addDialogueItem("AI", aiResponse);
    }

    // 添加对话项到容器中
    addDialogueItem(speaker: string, message: string) {
        if (!this.dialogueItemPrefab) {
            console.error("DialogueItem prefab is not assigned!");
            return;
        }

        const dialogueItem = instantiate(this.dialogueItemPrefab);

        const speakerNode = dialogueItem.getChildByName("Speaker");
        const messageNode = dialogueItem.getChildByName("Message");

        if (!speakerNode || !messageNode) {
            console.error("DialogueItem prefab structure is incorrect! 'Speaker' or 'Message' node is missing.");
            return;
        }

        const speakerLabel = speakerNode.getComponent(Label);
        const messageLabel = messageNode.getComponent(Label);

        if (!speakerLabel || !messageLabel) {
            console.error("Label component is missing on 'Speaker' or 'Message' node.");
            return;
        }

        speakerLabel.string = `${speaker}:`;
        messageLabel.string = message;

        if (!this.dialogueContainer) {
            console.error("DialogueContainer is not assigned!");
            return;
        }

        this.dialogueContainer.addChild(dialogueItem);

        const scrollView = this.dialogueContainer.parent.getComponent(ScrollView);
        if (scrollView) {
            scrollView.scrollToBottom(0.3);
        }
    }
}
