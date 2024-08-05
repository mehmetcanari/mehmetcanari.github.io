class CubeManager {
    constructor(scene, character, scoreManager) {
        this.scene = scene;
        this.character = character;
        this.scoreManager = scoreManager;
        this.collectedCubes = [];
        this.velocity = new THREE.Vector3();
        this.lastPosition = new THREE.Vector3();
        this.isDropping = false;
        this.dropInterval = null;
        this.inDropZone = false;
    }

    checkCollision(obj1, obj2) {
        const box1 = new THREE.Box3().setFromObject(obj1);
        const box2 = new THREE.Box3().setFromObject(obj2);
        return box1.intersectsBox(box2);
    }

    collectCube(collectible) {
        this.scene.remove(collectible);
        const stackCube = collectible.clone();
        stackCube.scale.set(0.5, 0.5, 0.5);
        stackCube.position.set(0, 2 - 0.25 + this.collectedCubes.length * 0.6, -0.6);
        this.character.add(stackCube);
        this.collectedCubes.push(stackCube);
    }

    updateStackCubes(isIdle) {
        const lerpFactor = 0.1;
        const maxLeanAngle = Math.PI / 6;
        const stackSpacing = 0.5;
        const followDistance = 1;
        const leanIncrement = 0.1;
        const rotationDelayFactor = 0.05;

        const localVelocity = this.velocity.clone().applyQuaternion(this.character.quaternion.clone().invert());
        let referenceRotationY = 0;
        if (!isIdle && this.collectedCubes.length > 0) {
            referenceRotationY = Math.atan2(localVelocity.x, stackSpacing) * 0.5;
        }

        for (let i = 0; i < this.collectedCubes.length; i++) {
            const currentCube = this.collectedCubes[i];
            let targetPosition, targetRotationX, targetRotationY;

            if (isIdle) {
                targetPosition = new THREE.Vector3(0, 1.5 + i * stackSpacing, -0.6);
                targetRotationX = 0;
                targetRotationY = 0;
            } else {
                const leanFactor = i * leanIncrement;
                const leanAngleX = Math.atan2(-localVelocity.z, stackSpacing) * 0.5 * (1 + leanFactor);

                targetRotationX = THREE.MathUtils.clamp(leanAngleX, -maxLeanAngle, maxLeanAngle);
                targetRotationY = referenceRotationY * (1 - Math.min(1, i * rotationDelayFactor));

                if (i === 0) {
                    targetPosition = new THREE.Vector3(0, 1.5, -0.6);
                } else {
                    const prevCube = this.collectedCubes[i - 1];
                    targetPosition = new THREE.Vector3(
                        prevCube.position.x - localVelocity.x * followDistance * (1 + leanFactor),
                        1.5 + i * stackSpacing,
                        prevCube.position.z - localVelocity.z * followDistance * (1 + leanFactor)
                    );
                }
            }

            currentCube.position.x = THREE.MathUtils.lerp(currentCube.position.x, targetPosition.x, lerpFactor);
            currentCube.position.z = THREE.MathUtils.lerp(currentCube.position.z, targetPosition.z, lerpFactor);
            currentCube.position.y = targetPosition.y;

            const targetEuler = new THREE.Euler(targetRotationX, targetRotationY, 0, 'XYZ');
            const targetQuaternion = new THREE.Quaternion().setFromEuler(targetEuler);
            currentCube.quaternion.slerp(targetQuaternion, lerpFactor);
        }
    }

    updateVelocity() {
        this.velocity.subVectors(this.character.position, this.lastPosition);
        this.lastPosition.copy(this.character.position);
    }

    startDropping(dropZone) {
        if (this.isDropping || this.collectedCubes.length === 0) return;

        this.isDropping = true;
        this.dropInterval = setInterval(() => {
            if (this.collectedCubes.length === 0 || !this.inDropZone) {
                this.stopDropping();
                return;
            }
            const cube = this.collectedCubes.pop();
            this.character.remove(cube);
            // Küpü sahneden tamamen kaldır
            cube.geometry.dispose();
            cube.material.dispose();
            this.scene.remove(cube);

            // Skoru arttır
            this.scoreManager.incrementScore();
        }, 10);
    }

    stopDropping() {
        if (this.dropInterval) {
            clearInterval(this.dropInterval);
            this.dropInterval = null;
            this.isDropping = false;
        }
    }

    updateDropZoneStatus(inDropZone) {
        if (inDropZone && !this.isDropping) {
            this.inDropZone = true;
            this.startDropping();
        } else if (!inDropZone && this.isDropping) {
            this.inDropZone = false;
            this.stopDropping();
        }
    }
}

export { CubeManager };
