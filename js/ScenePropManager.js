export class ScenePropManager {
    constructor(scene) {
        this.scene = scene;
        this.cubes = [];
        this.dropZone = null;
        this.house = null; // Reference to the house model
        this.houseScaleTarget = 0; // Target scale for the house
        this.particleSystem = null; // Reference to the particle system
    }

    createCubesInGrid(rows, columns, startX, startZ, spacing) {
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                const cubeMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(Math.random(), Math.random(), Math.random()) });
                const smallCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
                smallCube.position.set(startX + j * spacing, 0.5, startZ + i * spacing);
                smallCube.name = 'collectible';
                this.scene.add(smallCube);
                this.cubes.push(smallCube);
            }
        }
    }

    createDropZone() {
        const geometry = new THREE.BoxGeometry(20, 1, 20);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
        this.dropZone = new THREE.Mesh(geometry, material);
        this.dropZone.position.set(0, 0.5, -45);
        this.dropZone.name = 'dropZone';
        this.scene.add(this.dropZone);
    }

    updateCubesRotation() {
        this.cubes.forEach(cube => {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            cube.rotation.z += 0.01;
        });
    }

    loadHouseModel() {
        new THREE.GLTFLoader().load('https://storage.googleapis.com/handler-reflections/house.glb', gltf => {
            this.house = gltf.scene;
            this.house.scale.set(0, 0, 0); // Start with scale 0
            this.house.position.set(0, 0, -45); // Centered on the plane
            this.house.rotation.y = Math.PI / -2; // Rotate 90 degrees around the Y-axis
            this.scene.add(this.house);
        });
    }

    updateHouseScale(deltaTime) {
        if (this.house) {
            const currentScale = this.house.scale.x;
            if (currentScale < this.houseScaleTarget) {
                const newScale = THREE.MathUtils.lerp(currentScale, this.houseScaleTarget, deltaTime * 0.5);
                this.house.scale.set(newScale, newScale, newScale);
                if (newScale >= 0.8 && currentScale < 1) {
                    this.playParticleEffect();
                    this.showPopup(); // Show the popup when house scale reaches target
                }
            }
        }
    }

    createParticleSystem() {
        const particles = new THREE.BufferGeometry();
        const particleCount = 500;
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const lifetime = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

            velocities[i * 3] = (Math.random() - 0.5) * 0.01; // Slower movement
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01; // Slower movement
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01; // Slower movement

            colors[i * 3] = Math.random();
            colors[i * 3 + 1] = Math.random();
            colors[i * 3 + 2] = Math.random();

            lifetime[i] = Math.random() * 2 + 1; // Random lifetime between 1 and 3 seconds
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particles.setAttribute('lifetime', new THREE.BufferAttribute(lifetime, 1));

        const material = new THREE.PointsMaterial({ size: 0.2, vertexColors: true, transparent: true }); // Larger size
        this.particleSystem = new THREE.Points(particles, material);
        this.particleSystem.userData = { startTime: performance.now() };
    }



    playParticleEffect() {
        if (!this.particleSystem) {
            this.createParticleSystem();
        }
        this.particleSystem.position.copy(this.house.position);
        this.scene.add(this.particleSystem);

        const duration = 3000; // Duration in milliseconds
        const startTime = performance.now();
        this.particleSystem.userData.startTime = startTime;

        const updateParticles = () => {
            const elapsedTime = performance.now() - startTime;
            const particles = this.particleSystem.geometry.attributes;
            const positions = particles.position.array;
            const velocities = particles.velocity.array;
            const lifetime = particles.lifetime.array;

            for (let i = 0; i < positions.length / 3; i++) {
                if (elapsedTime < lifetime[i] * 1000) {
                    positions[i * 3] += velocities[i * 3];
                    positions[i * 3 + 1] += velocities[i * 3 + 1];
                    positions[i * 3 + 2] += velocities[i * 3 + 2];
                } else {
                    positions[i * 3] = positions[i * 3 + 1] = positions[i * 3 + 2] = 0;
                }

                const alpha = Math.max(0, 1 - elapsedTime / duration);
                this.particleSystem.material.opacity = alpha;
            }

            particles.position.needsUpdate = true;

            if (elapsedTime < duration) {
                requestAnimationFrame(updateParticles);
            } else {
                this.scene.remove(this.particleSystem);
            }
        };

        updateParticles();
    }





    showPopup() {
        setTimeout(() => {
            const popup = document.getElementById('popup');
            const popupImage = document.getElementById('popup-image');
            popupImage.src = 'https://storage.googleapis.com/handler-reflections/farm-background.jpg';
            popup.style.display = 'block';
        }, 1000); // Delay of 1 second (1000 milliseconds)
    }

}
