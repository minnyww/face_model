import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

// async function getFullFaceDescription(blob, inputSize = 512) {
//   // tiny_face_detector options
//   let scoreThreshold = 0.5;
//   const OPTION = new faceapi.TinyFaceDetectorOptions({
//     inputSize,
//     scoreThreshold
//   });
//   const useTinyModel = true;

//   // fetch image to api
//   let img = await faceapi.fetchImage(blob);

//   // detect all faces and generate full description from image
//   // including landmark and descriptor of each face
//   let fullDesc = await faceapi
//     .detectAllFaces(img, OPTION)
//     .withFaceLandmarks(useTinyModel)
//     .withFaceDescriptors();
//   return fullDesc;
// }


// function loadLabeledImages() {
//   const labels = ['Jisoo', 'Lisa', 'Rose', 'Jennie']
//   return Promise.all(
//     labels.map(async label => {
//       const descriptions = []
//       for (let i = 1; i <= 4; i++) {
//         const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/BorntoDev/FaceRegJS/master/labeled_images/${label}/${i}.jpg`)
//         const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
//         descriptions.push(detections.descriptor)
//       }

//       return new faceapi.LabeledFaceDescriptors(label, descriptions)
//     })
//   )
// }

// const Face = ({ image }) => {
//   console.log('image : ', image)
//   // const { url, width, height } = image;
//   const [faces, setFaces] = useState([]);
//   const imgRef = useRef();
//   const canvasRef = useRef();

//   const handleImage = async () => {
//     await getFullFaceDescription(URL.createObjectURL(image.target.files[0])).then(fullDesc => {
//       console.log('fullDesc : ', fullDesc)
//     });


//     // const labeledFaceDescriptors = await loadLabeledImages()
//     // console.log('labeledFaceDescriptors : ', labeledFaceDescriptors)
//     // const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
//     // const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()

//     // // const detections = await faceapi.detectAllFaces(
//     // //   imgRef.current,
//     // //   new faceapi.TinyFaceDetectorOptions()
//     // // );
//     // // console.log('detections : ', detections)


//     // const displaySize = { width: image.width, height: image.height }
//     // const resizedDetections = faceapi.resizeResults(detections, displaySize)
//     // console.log('resizedDetections : ,', resizedDetections)

//     // setFaces(detections.map((d) => Object.values(d.box)));
//   };

//   const enter = () => {
//     const ctx = canvasRef.current.getContext("2d");
//     ctx.lineWidth = 5;
//     ctx.strokeStyle = "yellow";
//     faces.map((face) => ctx.strokeRect(...face));
//   };

//   useEffect(() => {
//     const loadModels = () => {
//       Promise.all([
//         faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
//         faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
//         faceapi.nets.faceExpressionNet.loadFromUri("/models"),

//       ])
//         .then(handleImage)
//         .catch((e) => console.log(e));
//     };

//     imgRef.current && loadModels();
//   }, []);

//   return (
//     <div style={{ position: 'relative' }}>
//       <div style={{ position: 'absolute' }}>
//         <img src={URL.createObjectURL(image.target.files[0])} alt="imageURL" />
//       </div>
//     </div>
//   )
// }

// const App = () => {

//   const [image, setImage] = useState()
//   // const [init, setIsInit] = useState(false)

//   // useEffect(() => {
//   //   Promise.all([
//   //     faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
//   //     faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
//   //     faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
//   //   ]).then(() => {
//   //     setIsInit(true)
//   //   })
//   // }, [])

//   // if (!init) return 'waiting..'
//   return (
//     <div className="container">

//       <input
//         onChange={(e) => {
//           const getImage = () => {
//             const img = new Image();
//             img.src = URL.createObjectURL(e);
//             img.onload = () => {
//               setImage(e);
//             };
//           };

//           e && getImage();
//         }}
//         id="file"
//         type="file"
//       />
//       {image && <Face image={image} />}
//     </div>
//   );
// };

// export default App

function App() {
  const canvasRef = useRef()
  const [isInit, setIsInit] = useState(false)
  const imageUpload = document.getElementById('imageUpload')
  const container = document.createElement('div')
  let image, canvas
  const [labeledFaceDescriptors, setDesc] = useState()


  useEffect(() => {
    Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
    ]).then(start)
  }, [])

  async function start() {
    const labeledFaceDescriptors = await loadLabeledImages()
    setDesc(labeledFaceDescriptors)
    setIsInit(true)
  }



  function loadLabeledImages() {
    const labels = ['Jisoo', 'Lisa', 'Rose', 'Jennie']
    return Promise.all(
      labels.map(async label => {
        const descriptions = []
        for (let i = 1; i <= labels.length; i++) {
          const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/minnywww/face_model/main/labeled_images/${label}/${i}.jpg`)
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
          descriptions.push(detections.descriptor)
        }
        console.log('descriptions : ', descriptions)
        return new faceapi.LabeledFaceDescriptors(label, descriptions)
      })
    )
  }

  const [imageUrl, setImageUrl] = useState()
  const [result, setResult] = useState()
  console.log('result : ', result)

  return (
    <div style={{ position: 'relative' }}>
      <h2>ระบบจดจำใบหน้า</h2>
      <input
        disabled={!isInit}
        type="file"
        id="imageUpload"
        onChange={async (imageUpload) => {
          console.log('in')
          const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
          if (image) image.remove()
          if (canvas) canvas.remove()
          image = await faceapi.bufferToImage(imageUpload.target.files[0])

          setImageUrl(image.src)
          // canvas = faceapi.createCanvasFromMedia(image)
          // container.append(canvas)
          const displaySize = { width: image.width, height: image.height }
          // faceapi.matchDimensions(canvas, displaySize)
          const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
          const resizedDetections = faceapi.resizeResults(detections, displaySize)
          const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
          setResult({ label: results[0].label, score: results[0].distance })
          // results.forEach((result, i) => {
          //   const box = resizedDetections[i].detection.box
          //   const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
          //   drawBox.draw(canvas)
          // })
          // const ctx = canvasRef.current.getContext("2d");
          // ctx.lineWidth = 5;
          // ctx.strokeStyle = "yellow";
          // results.map((face) => ctx.strokeRect(...face));
        }} />
      <img alt="test" src={imageUrl} width={400} height={400} />
      <h4>{result?.label} with score {result?.score.toFixed(2)}</h4>
    </div>
  )
}
export default App 