import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import * as THREE from 'three';

const getCurrentTime = function() {
    return performance.now() / 1000;
};

class GsRenderer extends GaussianSplats3D.Viewer {
    constructor(options) {
        super(options);
        super.removeEventHandlers();
        this.fullScreenControl = options.fullScreenControl || false;
        this.mouseDown = false;
        this.setupControls();
        this.setupEventHandlers();
        this.setWhiteBackground();
        // const intialCamPos = new THREE.Vector3().fromArray([-182.66668, 11.60506, -148.92582]);
        // const camPos2 = new THREE.Vector3().fromArray([-186.496, 1.7562, -132.5113]);
        // const camPos3 = new THREE.Vector3().fromArray([-175.336, 6.3544, -140.1749]);
        // const camPos4 = new THREE.Vector3().fromArray([-194.717, 7.5803, -142.2181]);
        // this.setupImageEventHandlers(document.getElementById('initial-image'), intialCamPos);
        // this.setupImageEventHandlers(document.getElementById('image-2'), camPos2);
        // this.setupImageEventHandlers(document.getElementById('image-3'), camPos3);
        // this.setupImageEventHandlers(document.getElementById('image-4'), camPos4);
    }
    setWhiteBackground() {
        this.renderer.setClearColor( 0xffffff, 1 );
    }
    onMouseMove(mouse) {
        const mouseDown = this.mouseDown | false;
        if (mouseDown) {
            this.mousePosition.set(mouse.offsetX, mouse.offsetY);
        }
    }
    onMouseDown() {
        super.onMouseDown();
        this.mouseDown = true;
    }
    onMouseUp = function() { 
        this.mouseDown = false;
        const clickOffset = new THREE.Vector2();

        return function(mouse) {
            clickOffset.copy(this.mousePosition).sub(this.mouseDownPosition);
            const mouseUpTime = getCurrentTime();
            const wasClick = mouseUpTime - this.mouseDownTime < 0.5 && clickOffset.length() < 2;
            if (wasClick) {
                this.onMouseClick(mouse);
            }
        };
    }
    onKeyDown = function() {
        return function(e) {
            if (e.shiftKey && e.code === 'KeyS') {
                console.log(this.camera.position);
            }
        };
    }();
    setupEventHandlers() {
        this.eventElement = this.renderer.domElement;
        if (this.useBuiltInControls && this.webXRMode === GaussianSplats3D.WebXRMode.None) {
            this.mouseMoveListener = this.onMouseMove.bind(this);
            this.eventElement.addEventListener('pointermove', this.mouseMoveListener, false);
            this.mouseDownListener = this.onMouseDown.bind(this);
            this.eventElement.addEventListener('pointerdown', this.mouseDownListener, false);
            this.mouseUpListener = this.onMouseUp.bind(this);
            this.eventElement.addEventListener('pointerup', this.mouseUpListener, false);
            this.keyDownListener = this.onKeyDown.bind(this);
            window.addEventListener('keydown', this.keyDownListener, false);
            // this.keyPressListener = this.onKeyPress.bind(this); 
            // window.addEventListener('keypress', this.keyPressListener, true);
        }
    }
    setupControls() {
        this.eventElement = this.renderer.domElement;
        if (this.fullScreenControl) {
            if (this.useBuiltInControls && this.webXRMode === GaussianSplats3D.WebXRMode.None) {
                if (!this.usingExternalCamera) {
                    this.perspectiveControls = new GaussianSplats3D.OrbitControls(this.perspectiveCamera, this.eventElement);
                    this.orthographicControls = new GaussianSplats3D.OrbitControls(this.orthographicCamera, this.eventElement);
                } else {
                    if (this.camera.isOrthographicCamera) {
                        this.orthographicControls = new GaussianSplats3D.OrbitControls(this.camera, this.eventElement);
                    } else {
                        this.perspectiveControls = new GaussianSplats3D.OrbitControls(this.camera, this.eventElement);
                    }
                }
                for (let controls of [this.orthographicControls, this.perspectiveControls,]) {
                    if (controls) {
                        controls.listenToKeyEvents(window);
                        controls.rotateSpeed = 0.5;
                        controls.maxPolarAngle = Math.PI * .75;
                        controls.minPolarAngle = 0.1;
                        controls.enableDamping = true;
                        controls.dampingFactor = 0.05;
                        controls.target.copy(this.initialCameraLookAt);
                        controls.update();
                    }
                }
                this.controls = this.camera.isOrthographicCamera ? this.orthographicControls : this.perspectiveControls;
                this.controls.update();
                this.controls.autoRotate = false;
            }
        }   
    }
    setupImageEventHandlers(imgElement, pos) {
        imgElement.addEventListener('mousedown', this.onMouseDownImg.bind(this, pos), false);
        imgElement.addEventListener('mouseup', this.onMouseUpImg.bind(this), false);
        imgElement.addEventListener('click', this.onMouseClickImg.bind(this, pos), false);
    }
    onMouseDownImg(pos) {
        // Reset camera position to initial position and pause auto rotation
        this.camera.position.copy(pos);
        this.camera.lookAt(this.initialCameraLookAt);
        this.controls.target.copy(this.initialCameraLookAt);
        this.controls.autoRotate = false;
    }
    onMouseUpImg() {
        this.controls.autoRotate = true;
    }
    onMouseClickImg(pos) {
        this.camera.position.copy(pos);
        this.camera.lookAt(this.initialCameraLookAt);
        this.controls.target.copy(this.initialCameraLookAt);
    }
}

export {GsRenderer};