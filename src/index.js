import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/radar';
import './index.css';
let questions = require('./question.json');
questions.sort(function () {
  return (0.5 - Math.random());
})

let myResultTab = null;
const tabFormateRs = [
  {
    cateKey: 'R',
    cateName: '实际型',
    score: 0,
    type: '家里你说了算',
    info: '愿意使用工具从事操作性工作，动手能力强，做事手脚灵活，动作协调。偏好于具体任务，不善言辞，做事保守，较为谦虚。缺乏社交能力，通常喜欢独立做事。'
  },
  {
    cateKey: 'C',
    cateName: '常规型',
    score: 0,
    type: '非常细心的人，另一半很幸福',
    info: '尊重权威和规章制度，喜欢按计划办事，细心、有条理，习惯接受他人的指挥和领导，自己不谋求领导职务。喜欢关注实际和细节情况，通常较为谨慎和保守，缺乏创造性，不喜欢冒险和竞争，富有自我牺牲精神。'
  },
  {
    cateKey: 'E',
    cateName: '企业型',
    score: 0,
    type: '你就是传说中的领导',
    info: '追求权力、权威和物质财富，具有领导才能。喜欢竞争、敢冒风险、有野心、抱负。为人务实，习惯以利益得失，权利、地位、金钱等来衡量做事的价值，做事有较强的目的性。'
  },
  {
    cateKey: 'S',
    cateName: '社会型',
    score: 0,
    type: '没办法，你到处都有朋友',
    info: '喜欢与人交往、不断结交新的朋友、善言谈、愿意教导别人。关心社会问题、渴望发挥自己的社会作用。寻求广泛的人际关系，比较看重社会义务和社会道德。'
  },
  {
    cateKey: 'A',
    cateName: '艺术型',
    score: 0,
    type: '没错，艺术家就该留长发',
    info: '有创造力，乐于创造新颖、与众不同的成果，渴望表现自己的个性，实现自身的价值。做事理想化，追求完美，不重实际。具有一定的艺术才能和个性。善于表达、怀旧、心态较为复杂。'
  },
  {
    cateKey: 'I',
    cateName: '研究型',
    score: 0,
    type: '很牛逼（除了头发）',
    info: '思想家而非实干家,抽象思维能力强，求知欲强，肯动脑，善思考，不愿动手。喜欢独立的和富有创造性的工作。知识渊博，有学识才能，不善于领导他人。考虑问题理性，做事喜欢精确，喜欢逻辑分析和推理，不断探讨未知的领域。'
  }
];
let tabFormateConfig = {
  radar: {
    name: {
      textStyle: {
        color: '#333333'
      }
    },
    radius: '70%',
    indicator: tabFormateRs.map(single => {
      return {
        name: single.cateKey,
        max: 10
      }
    })
  }
}

// 头部
const Header = (props) => {
  return (
    <header>霍兰德职业兴趣测试</header>
  )
}

// 介绍
const Introduce = (props) => {
  return (
    <div className={props.show ? 'introduce' : 'hide'}>霍兰德职业适应性测验(The Self-Directed Search，简称SDS)由美国著名职业指导专家 Ｊ.霍兰德（ＨＯＬＬＡＮＤ）编制。在几十年间经过一百多次大规模的实验研究，形成了人格类型与职业类型的学说和测验。 该测验能帮助被试者发现和确定自己的职业兴趣和能力专长, 从而科学地做出求职择业。</div>
  )
}

// 测试题目
class Question extends Component {
  constructor() {
    super();
    this.state = {
      questions: questions,
      no: 1,
      nums: questions.length,
      myResults: {}
    }
  }

  handleAnswer(answer) {
    let no = this.state.no,
      question = this.state.questions[this.state.no - 1],
      myResults = this.state.myResults;
    if (no >= this.state.nums) {
      // 问题回答结束
      this.props.finishQuestion(myResults);
      this.setState({
        no: 1
      })
    } else {
      if (!myResults[question.cateKey]) {
        myResults[question.cateKey] = 0
      }
      myResults[question.cateKey] += answer === question.score ? 1 : 0
      this.setState({
        no: ++no,
        myResults: myResults
      })
    }
  }

  render() {
    return (
      <div className={this.props.show ? 'question' : 'hide'}>
        <div className="questionNo"><span className="no">{this.state.no}</span><span className="nums"> / {this.state.nums}</span></div>
        <p className="title">{this.state.questions[this.state.no - 1].title}</p>
        <p className="action">
          <span className="button" onClick={this.handleAnswer.bind(this, 1)}>是的</span>
          <span className="button" onClick={this.handleAnswer.bind(this, 0)}>不是</span>
        </p>

      </div>
    )
  }
}

// 测试结果
class Result extends Component {
  constructor() {
    super()
    this.state = {
      rs: '待测试',
      type: '还没有分析',
      info: ''
    }
  }

  // 初始化图表
  componentDidMount() {
    if (!myResultTab) {
      myResultTab = echarts.init(document.getElementById('myResultTab'));
    }
  }
  componentWillReceiveProps(props) {
    // 画图
    if (props.results) {
      this.resultAnalysis(props.results)
    }
  }
  // 测试结果分析
  resultAnalysis(results) {
    let tempTypes = tabFormateRs.map(single => {
      single.score = results[single.cateKey] || single.score
      return single
    });
    let rsData = tempTypes.concat();
    // 查询前三的结果
    rsData.sort((x, y) => {
      if (x.score > y.score) {
        return -1
      } else if (x.score < y.score) {
        return 1;
      } else {
        return 0;
      }
    })
    this.setState({
      rs: rsData[0].cateKey + rsData[1].cateKey + rsData[2].cateKey,
      type: rsData[0].type,
      info: rsData[0].info
    })

    tabFormateConfig.series = [{
      type: 'radar',
      data: [
        {
          value: tempTypes.map(single => single.score),
          symbol: 'circle',
          symbolSize: 3,
          lineStyle: {
              normal: {
                  color: '#ea8973'
              }
          },
          areaStyle: {
            normal: {
                opacity: 0.7,
                color: '#ea8973'
            }
          }
        }
      ]
    }];
    myResultTab.setOption(tabFormateConfig)
  }

  render() {
    return (
      <div className={this.props.show ? 'result' : 'hide'}>
        <span className="rs">您的霍兰德类型是：{this.state.rs}</span>
        <div id="myResultTab"></div>
        <div className="info">
          <span className="title">结果解读</span>
          <p>
            <span className="type">{this.state.type}</span>
            <br/>
            {this.state.info}
          </p>
        </div>
      </div>
    )
  }
}

// 尾部
const Footer = (props) => {
  return (
    <footer>©2018 ClayIdols</footer>
  )
}


class MkTest extends Component {
  constructor() {
    super()
    this.state = {
      isStarted: false,
      isFinished: false
    }
  }

  startTest() {
    this.setState({
      isStarted: true
    });
  }

  finishQuestion(results) {
    this.setState({
      isFinished: true,
      results: results
    });
  }

  render() {
    return (
      <div className="mktest">
        <Header />
        <div className="testBody">
          <Introduce show={!this.state.isStarted} />
          <span className={!this.state.isStarted ? 'startButton' : 'hide'} onClick={this.startTest.bind(this)}>开始测试</span>
          <Question show={this.state.isStarted && !this.state.isFinished} finishQuestion={this.finishQuestion.bind(this)} />
          <Result show={this.state.isFinished} results={this.state.results} />
        </div>
        <Footer />
      </div>
    )
  }
}

ReactDOM.render(
  <MkTest />,
  document.getElementById('root')
)
