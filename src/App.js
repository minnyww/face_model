import { useCallback, useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import Webcam from "react-webcam";

function App() {
  const webcamRef = useRef(null);

  const videoConstraints = {
    width: 420,
    height: 420,
    facingMode: "user",
  };
  const [isInit, setIsInit] = useState(false)
  let canvas = document.getElementById('overlay')
  // const container = document.getElementById('container')
  let image
  // const [labeledFaceDescriptors, setDesc] = useState()

  const start = useCallback(async () => {
    // container.style.position = 'relative'
    // document.body.append(container)
    // const labeledFaceDescriptors = await loadLabeledImages()
    // setDesc(labeledFaceDescriptors)
    setIsInit(true)
  }, [])


  useEffect(() => {
    Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
    ]).then(() => {
      start()
    })
  }, [])


  function loadLabeledImages() {
    const labels = ['Lisa', 'Pang', 'Justin', "Bas"]
    return Promise.all(
      labels.map(async label => {
        const descriptions = []
        for (let i = 1; i <= 1; i++) {
          const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/minnyww/face_model/main/labeled_images/${label}/${i}.jpg`)
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
          descriptions.push(detections.descriptor)
        }
        return new faceapi.LabeledFaceDescriptors(label, descriptions)
      })
    )
  }


  const detectFace = async (imageFile, dontBufferImage) => {
    const labeledFaceDescriptors = await loadLabeledImages()
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    if (image) image.remove()
    if (canvas) canvas.remove()
    // if (!dontBufferImage) {
    image = await faceapi.bufferToImage(imageFile)
    setImageUrl(image.src)
    // } else {
    // image = `<img src=${imageFile} >`
    // setImageUrl(imageFile)
    // }
    canvas = faceapi.createCanvasFromMedia(image)
    canvasRef.current.innerHTML = canvas

    const displaySize = { width: 400, height: 400 }

    // const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvasRef.current, displaySize)
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    console.log('results : ', results)
    // faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
    // faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections, .05);

    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
      drawBox.draw(canvasRef.current)
    })


    // const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    // if (image) image.remove()
    // if (canvas) canvas.remove()
    // image = await faceapi.bufferToImage(imageUpload.target.files[0])

    // setImageUrl(image.src)
    // canvas = faceapi.createCanvasFromMedia(image)

    // const displaySize = { width: image.width, height: image.height }
    // faceapi.matchDimensions(canvas, displaySize)
    // const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    // const resizedDetections = faceapi.resizeResults(detections, displaySize)
    // const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))

    // const resultsList = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    // resultsList.forEach((result, i) => {
    //   const box = resizedDetections[i].detection.box
    //   const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
    //   drawBox.draw(canvas)
    // })


    // if (results?.length > 0) {
    //   setResult({ label: results[0]?.label, score: results[0]?.distance })
    // }
  }
  const [imageUrl, setImageUrl] = useState()
  const [img, setImg] = useState(null);
  const canvasRef = useRef()

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();

    // const resultImageCropped = new File(
    //   [imageSrc],
    //   "face.png",
    //   {
    //     type: "image/png",
    //     lastModified: Date.now(),
    //   }
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((myBlob) => {
        console.log(myBlob);
        const resultImageCropped = new File(
          [myBlob],
          "face.png",
          {
            type: "image/png",
            lastModified: Date.now(),
          })
        detectFace(resultImageCropped, true)

      });
    // );
    // setImg(resultImageCropped);
    // console.log('imageSrc : ', imageSrc)
  }, [image?.type]);


  return (
    <div>
      <h2>ระบบจดจำใบหน้า</h2>
      <input
        disabled={!isInit}
        type="file"
        id="imageUpload"
        onChange={(imageUpload) => {
          detectFace(imageUpload.target.files[0])

        }} />
      <div style={{ position: 'relative', width: '100%' }} id="container">
        <img alt="test" src={imageUrl} width={400} height={400} />
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', left: 0 }}
        />
      </div>

      <Webcam
        audio={false}
        mirrored={true}
        height={400}
        width={400}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
      />
      <button onClick={capture}>Capture photo</button>
      {/* <h4>{result?.label} with score {result?.score.toFixed(2)}</h4> */}
      {/* <canvas id="#overlay" /> */}
    </div>
  )
}
export default App 