
import './App.css';
import React, {useState, useEffect} from 'react';
import * as tf from '@tensorflow/tfjs';
import * as speech from '@tensorflow-models/speech-commands';
import questions from './questions.json'
import ResultTable from './components/result';
import Question from './components/question';

function App() {

  const [model, setModel] = useState(null)
  const [action, setAction] = useState(null)
  const [labels, setLabels] = useState(null)
  const [started, setStarted] = useState(false)
  const [generateResult, setGenerateResult] = useState(false)
  const [showingResults, setShowingResults] = useState(false)
  const [answers, setAnswers] = useState([])

  const [currentIndex, setCurrentIndex] = useState(0)

  const loadModel = async ()=>{

      const recognizer  = await speech.create('BROWSER_FFT')
      console.log("Model Loaded")
      await recognizer.ensureModelLoaded()
      console.log(recognizer.words)
      // console.log(recognizer.wordLabels())
      setModel(recognizer)
      setLabels(recognizer.words)
  }

  useEffect(()=>{loadModel()}, [])
  function argMax(arr){

        return arr.map((x, i)=> [x, i]).reduce((r, a)=> (a[0] > r[0] ? a:r))[1];

  }

  const handleStartedClick= ()=>{

      setStarted(true)
      setGenerateResult(false)
      setShowingResults(false)
      setAnswers([])
      setCurrentIndex(0)
      recognizeCommand()

  }

  const recognizeCommand = async () => {

    if(model.streaming === false){
      model.listen(result => {
      setAction(labels[argMax(Object.values(result.scores))])
    }, {includeSpectrogram :true, probabilityThreshold:0.9})}

  }

  const handleNextClick = ()=>{
    console.log(answers)
    if(currentIndex < 9){
      if(action === 'yes' || action === 'no'){
        console.log(action)
        setAnswers((prevAnswers)=> [...prevAnswers, action])
        setAction("")
        
          setCurrentIndex((prevIndex)=> prevIndex+1)
        }

    }
    else{
      console.log(answers)
      if(model.streaming){
      model.stopListening()
      }
      setGenerateResult(true)
    }
    // setTimeout(()=>model.stopListening(), 5e3)

  }

  const handleGenerateResult = () =>{

      setShowingResults(true)
      setGenerateResult(false)

  }
  return (
    <div className="App">
      <header className="App-header">
        
        {!started ? <div><button  onClick={handleStartedClick}>Start Answering</button></div> : null}
        {started && !generateResult && !showingResults ? <div><Question question={questions[currentIndex]}></Question>
        <button onClick={handleNextClick}>Submit & Next</button>
        {action === 'yes'|| action ==='no' || action === "" ? <div><h1>{action}</h1></div>: <div>Ambigious,  (Try Agin)!</div>}</div>: null}
      {generateResult && <div><button onClick={handleGenerateResult}>Generate Results</button></div>}
      {showingResults && <div><ResultTable questions={questions} allAnswers={answers}></ResultTable> <button onClick={handleStartedClick}>Start Answering</button></div>}
      </header>
    </div>
  );
}

export default App;
