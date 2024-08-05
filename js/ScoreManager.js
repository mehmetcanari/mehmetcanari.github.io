export class ScoreManager {
    constructor(scenePropManager) {
        this.score = 0;
        this.scenePropManager = scenePropManager;
        this.createUI();
    }

    createUI() {
        const scoreElement = document.createElement('div');
        scoreElement.id = 'score';
        scoreElement.style.position = 'absolute';
        scoreElement.style.top = '100px';
        scoreElement.style.left = '50%';
        scoreElement.style.transform = 'translateX(-50%)';
        scoreElement.style.fontSize = '40px';
        scoreElement.style.color = '#fff';
        scoreElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        scoreElement.style.borderRadius = '10px';
        document.body.appendChild(scoreElement);
        this.updateUI();
    }

    updateUI() {
        const scoreElement = document.getElementById('score');
        scoreElement.textContent = `Score: ${this.score}`;
    }

    incrementScore() {
        this.score += 1;
        this.updateUI();
        if (this.score > 100 && this.scenePropManager.houseScaleTarget === 0) {
            this.scenePropManager.houseScaleTarget = 1;
        }
    }
}
