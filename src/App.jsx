import styled from "styled-components"
import { Delete, Plus, Minus, Equal, X, Divide } from "lucide-react";
import { useEffect, useState } from "react";
// import Falar from "./components/falar";

//Lista de coisas pra fazer
//verificação se a tecla pode ser teclada ou nao

function App() {
  const [texto, setTexto] = useState();
  const [info, setInfo] = useState([]); // recebe o numero que o usuário clicar
  const msg = new SpeechSynthesisUtterance();
  const [isResult, setIsResult] = useState(false); // verificação se ele já falou o resultado 
  const [isDeleted, setIsDeleted] = useState(false); //verificação se ele ja falou o numero que foi apagado
  var expressao = [];
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const operadores = ['+', '-', '/', '*', '%'];
  const [numeros, setNumeros] = useState([]);
  let operadorSobrou = null;

  useEffect(() => { //verificações antes de fazer a conta
    expressao = numeros.join('').split(/\s*([+\-*%/=])\s*/).filter(token => token !== '');
    //separa os numeros das operações, e depois filtra se existe espaços vazios na array

    if (expressao[0] == '-') {
      expressao[1] = `${parseInt(expressao[1] * -1)}`;
      expressao.splice(0, 1);
    }//verifica se o 1º numero e negativo e tranforma ele em negativo dentro da array

    expressao.forEach((elemento, index) => {

      if (operadores.includes(expressao[index]) && operadores.includes(expressao[index - 1])) {
        expressao[index - 1] = expressao[index];
        expressao.splice(index, 1);
        setNumeros(expressao);
      } //verifica se o usuario está colocando 2 operadores e substitui o primeiro operador digitado.
    });

    if (expressao.includes('=')) {
      if (operadores.includes(expressao[0]) || expressao.length <= 3) {
        Reconhecer('operação invalida');
        setNumeros([]);
        return
      }//verifica se uma operação é valida
      if (expressao.length === 4 && expressao[3] == '=') {
        expressao.pop()
        conta();
        return
      }// calcula assim que tiver 4 elementos na operação e o usuário clicar no =
    }
    if (expressao.length === 4 && operadores.includes(expressao[3])) {
      if (expressao[3] == '%') {
        expressao[2] = (expressao[2] * expressao[0]) / 100;
        expressao.pop();
        conta();
        //calculando porcentagem
      } else {
        operadorSobrou = expressao[3];
        expressao.pop();
        conta()
      }//executa a conta quando um 2º operador é clicado, e guarda esse operador para dps
    } else {
      if (numeros.length > 0 && isResult == false && isDeleted == false) {
        operadorSobrou = null;
        let elemento = numeros[numeros.length - 1];
        Reconhecer(elemento)
      }// fala o que o usuário clica
      setIsResult(false);
    }
  }, [numeros])

  useEffect(() => { //para funcionar no teclado
    const key = (e) => {
      if (numbers.includes(e.key) || operadores.includes(e.key) || e.key == '.' || e.code == 'KeyC' || e.key == 'Backspace' || e.key == 'Enter') {
        if (e.code == 'KeyC') {
          limpar(); // caso a tecla C seja clicada ele vai limpar o visor
          return;
        } if (e.key == 'Backspace') {
          setNumeros((num) => apagar(num)); //caso a tecla de apagar seja clicada ele vai apagar o ultimo digito
          return;
        } if (e.key == 'Enter') {
          setNumeros((num) => [...num, '=']) //caso enter seja clicado ele vai efetuar a conta
          return;
        } if (e.key == '.') {
          numeros[numeros.length - 1] == '.' ? ' ' : setNumeros((num) => [...num, '.']) //caso o ponto seja clicado ele vai mandar para o numeros
          return;
        } if (numbers.includes(e.key) || operadores.includes(e.key)) { //manda todos os numeros e operadores clicados pelo teclado para o numeros
          setNumeros((num) => [...num, e.key])
          return;
        }
      }
    }
    window.addEventListener("keydown", key) //nao sei
    return () => window.removeEventListener('keydown', key); //
  }, [])

  useEffect(() => { //para falar
    if (info.toString() !== '') {
      Reconhecer(info.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info])

  useEffect(() => { //para falar
    Falar(texto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto])

  function Reconhecer(numero) { //reconhecendo os operadores antes de falar
    if (operadores.includes(numero) || numero == '.') {
      switch (numero) {
        case '-':
          setTexto("menos");
          return;
        case '/':
          setTexto("dividido por");
          return;
        case '*':
          setTexto("vezes");
          return;
        case '+':
          setTexto("mais");
          return;
        case '.':
          setTexto("ponto");
      }
    }
    Falar(numero); // caso nao seja um operador ele fala direto
    return;
  }

  function Falar(mensagem) { // para falar
    msg.text = mensagem;
    window.speechSynthesis.speak(msg);
  }

  function apagar(num) { //para apagar o ultimo digito
    //apagar no teclado
    if (num && num.length > 0) {
      Reconhecer(`apagou ${num.pop()}`) //fala e apaga o ultimo digito

      setTimeout(() => {
        if (isDeleted == false) {
          Reconhecer(`sobrou ${num}`) //fala os numeros que sobraram
        }
      }, 1000); //tempo antes de falar para nao acontecer repetição

      let atualizacao = [...num]
      setNumeros(atualizacao); //atualiza no visor o numero que foi apagado
      setIsDeleted(true)
      return num;
    }
    //apagar na tela
    if (numeros.length != 0) {
      Reconhecer(`apagou ${numeros[numeros.length - 1]}`) //fala o numero que vai ser apagado
    }
    let apagarNumeros = [...numeros];
    apagarNumeros.pop(); //apaga o ultimo digito

    setTimeout(() => {
      if (apagarNumeros.length != 0 && isDeleted == false) {
        Reconhecer(`sobrou: ${apagarNumeros}`); //fala oq sobrou 
      }
    }, 1000); //seta um tempo antes de fala oq sobrou
    setNumeros(apagarNumeros); //atualiza no visor oq foi apagado
    setIsDeleted(true)
  }
  function limpar() { //apaga a operação toda
    setNumeros([]);
    setInfo('Apagou toda a operação');
  }


  function conta() {
    const operacoes = [];
    const valores = [];
    //arrays em que vamos separar operadores e numeros

    expressao.forEach((elemento) => {
      if (operadores.includes(elemento)) {
        operacoes.push(elemento)
      }//se for um operador vai para o array de operações
      else { valores.push(parseFloat(elemento) || 0) }
    });//se nao for um operador vai colocar como ponto flutuante dentro da array valores

    for (let i = 0; i < operacoes.length; i++) {
      if (operacoes[i] === '*') {
        Falar(`${valores[i]} vezes ${valores[i + 1]}`);
        valores[i] = valores[i] * valores[i + 1];
        //se na array operações aparecer um * ele vai falar e multiplicar os valores; 
      } else if (operacoes[i] === '/') {
        if (valores[i] != 0 && valores[i + 1] != 0) {
          Falar(`${valores[i]} dividido por ${valores[i + 1]}`);
          valores[i] = valores[i] / valores[i + 1];
          //se na array operações aparecer um / ele vai verificar se nenhum dos numeros é 0, falar e dividir os valores;
        } else {
          setNumeros([]);
          Reconhecer("essa operação não é permitida")
          return
        }// caso tenha um 0 nessa expressao ele nao executa a conta, apenas limpa a array
      }
      else if (operacoes[i] === '+') {
        Falar(`${valores[i]} + ${valores[i + 1]}`);
        valores[i] = valores[i] + valores[i + 1];
      } else if (operacoes[i] === '-') {
        Falar(`${valores[i]} menos ${valores[i + 1]}`);
        valores[i] = valores[i] - valores[i + 1];
      }
      valores.splice(i + 1, 1); //remove todos os i + 1 desnecessarios e deixa somente o resultado
      operacoes.splice(i, 1); //remove o operador
      i--;

    }

    let resultado = valores[valores.length - 1] //seta o resultado como o ultimo valor da array valores

    setTimeout(() => { //seta um tempo antes de falar o resultado

      if (operadorSobrou != null) {
        if (Number.isInteger(resultado)) {

          setNumeros([resultado, operadorSobrou]); //guarda o resultado e operador que sobrou
          Falar(`é igual à ${resultado}`); // fala o resultado
        } else {

          setNumeros([resultado.toFixed(2), operadorSobrou]); //caso o numero nao seja inteiro
          Falar(`é igual à ${resultado.toFixed(2)}`);
        }
      } else {
        if (Number.isInteger(resultado)) {

          setNumeros([resultado]);
          Falar(`é igual à ${resultado}`);
        } else {

          setNumeros([resultado.toFixed(2)]);
          Falar(`é igual à ${resultado.toFixed(2)}`);
        }

      }
    }, 1500);
    setIsResult(true)
    return valores[valores.length - 1];
  }


  return (

    <>
      <Wrapper>
        <Calculadora>
          <Visor>
            <p>
              {numeros.length > 0 ? numeros.join('') : 0}
            </p>
          </Visor>
          <Teclas>
            <Coluna>
              {/* limpar */}
              <Tecla onClick={limpar}>C</Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '7']) }}>7</Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '4']) }}>4</Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '1']) }}>1</Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '0']) }}>0</Tecla>
            </Coluna>
            <Coluna>
              <Tecla onClick={() => { setNumeros([...numeros, '/']) }}><Divide size={48} strokeWidth={2} /></Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '8']) }}>8</Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '5']) }}>5</Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '2']) }}>2</Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '.']) }}>.</Tecla>
            </Coluna>
            <Coluna>
              <Tecla onClick={() => { setNumeros([...numeros, '*']) }}><X size={48} strokeWidth={2} /></Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '9']) }}>9</Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '6']) }}>6</Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '3']) }}>3</Tecla>
              {/* porcentagem */}
              <Tecla onClick={() => { setNumeros([...numeros, '%']) }}>%</Tecla>
            </Coluna>
            <Coluna>
              {/* delete */}
              <Tecla onClick={apagar}><Delete size={48} strokeWidth={2} /></Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '+']) }}><Plus size={48} strokeWidth={2} /></Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '-']) }}><Minus size={48} strokeWidth={2} /></Tecla>
              {/* mostrar */}
              <Tecla className="igual" onClick={() => setNumeros([...numeros, '='])}><Equal size={48} strokeWidth={2} /></Tecla>
            </Coluna>
          </Teclas>
        </Calculadora>
      </Wrapper>
    </>
  )
}

export default App

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 3rem;
  
  `
const Calculadora = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 20rem;
  height: 25rem;
  background-color: #dad7cd;
  border-radius: 1rem;
  `

const Visor = styled.div`
  border-radius: 1rem;
  width: 16rem;
  padding-block: 0.2rem;
  background-color: #a3b18a;
  box-shadow: 6px 6px #588157;
  margin-bottom: 1rem;
  text-align: right;
  padding-right: 30px;
  .p{
    display: flex;
    align-items: end;
    width: 100%;
    }

`

const Teclas = styled.div`
  display: flex;
  flex-direction: row;
  
`
const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  .igual{
    padding-block: 2.80rem;
    padding-inline: 1.45rem;
  }
`
const Tecla = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding-block: 1.15rem;
    padding-inline: 1.45rem;
    background-color: #a3b18a;
    border-radius: 1rem;
    box-shadow: 6px 6px #588157;
    margin: 2px;
    cursor: pointer;

`
