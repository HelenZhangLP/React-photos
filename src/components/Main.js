require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';


// 获取图片数据
let imgDatas = require('../data/imageDatas.json');

//@argm imgdatas 图片数据，图片名称转换为图片数据
let imgDatasArr = (function(imgDatasArr){

	for (var i = 0; i < imgDatasArr.length; i++) {
		imgDatasArr[i].imgUrl = require('../images/' + imgDatasArr[i].fileName);
	}

	return imgDatasArr;
})(imgDatas)

//定义图片组件
class ImgFigure extends React.Component {
	constructor(){
		super();
	}

	componentWillReceiveProps(nextProps){
		this.setState({
			range: nextProps.range
		})
	}

	render() {
		let tempStyleObj = {};

		if(this.props.range && this.props.range.pos) {
			tempStyleObj = this.props.range.pos;
		}
		if(this.props.range.rotate){
			(['-webkit-','-moz-','-o-','-ms-']).forEach((item)=>{
				tempStyleObj[item+'transform'] = 'rotate('+ this.props.range.rotate +'deg)';
			})

			console.log(tempStyleObj,4);
		}
		return (
			<figure className="img-figure" ref={this.props.imgFigureRef} style={tempStyleObj}>
				<img src={this.props.data.imgUrl} title={this.props.data.fileName} />
				<figcaption>
					<h2>{this.props.data.title}</h2>
				</figcaption>
			</figure>
		)
	}
};


class AppComponent extends React.Component {
	constructor() {
		super();

		//getInitialState()
		this.state = {
			imgFigures: [],
			imgArrangeArr: [
				/*{
					pos: {
						left: 0,
						top: 0
					},
					rotate: 0
				}*/
			],
			Constant: {
			 	centerPos: {
			 		left: 0,
			 		top: 0
			 	},
			 	horizontalPosRange: {
			 		leftSectionX: [0,0],
			 		rightSectionX: [0,0],
			 		y: [0,0]
			 	},
			 	verticalPosRange: {
			 		x: [0,0],
			 		y: [0,0]
			 	}
			}
		}

	}

	//组件初始化阶段，组件即将加载时。。。 render 前
	componentWillMount() {
		
	}

	/*
	 * 计算图片位置信息的前提是取得图片及显示区的大小
	 * 计算图片及显示区大小
	 */
	getCoordinateRange() {
		//初始化水平、垂直、中心点的位置信息
		let Constant = this.state.Constant;
		/*
		 * 计算显示区、图片大小
		 * 知识点：这里需要获取真实的 Dom 节点，需要用到 ref 属性
		 * 				virtual dom 中添加 ref 属性
		 *				使用 this.refs[refname] 获取真实的 DOM 节点
		 *				ref添加到Compoennt上获取的是Compoennt实例，添加到原生HTML上获取的是DOM
		 */
		//显示区数据
		let stageDom = this.stage,
		stageW = stageDom.scrollWidth,
		stageH = stageDom.scrollHeight,
		stageWHalf = Math.ceil(stageW / 2),
		stageHHalf = Math.ceil(stageH / 2);

		//图片数据
		let imgFigureDom = this.imgFigureDom,
		imgFigureW = imgFigureDom.scrollWidth,
		imgFigureH = imgFigureDom.scrollHeight,
		imgFigureWHalf = Math.ceil(imgFigureW / 2),
		imgFigureHHalf = Math.ceil(imgFigureH / 2);

		//计算中心图片坐标
		Constant.centerPos.left = stageWHalf - imgFigureWHalf;
		Constant.centerPos.top = stageHHalf - imgFigureHHalf;

		//计算水平方向坐标范围
		Constant.horizontalPosRange.leftSectionX[0] = -imgFigureWHalf;
		Constant.horizontalPosRange.leftSectionX[1] = stageWHalf - imgFigureWHalf * 3;
		Constant.horizontalPosRange.rightSectionX[0] = stageWHalf + imgFigureWHalf;
		Constant.horizontalPosRange.rightSectionX[1] = stageW - imgFigureWHalf;
		Constant.horizontalPosRange.y[0] = -imgFigureHHalf;
		Constant.horizontalPosRange.y[1] = stageH - imgFigureHHalf;

		//垂直方向坐标取值范围
		Constant.verticalPosRange.x[0] = stageWHalf - imgFigureH;
		Constant.verticalPosRange.x[1] = stageWHalf;
		Constant.verticalPosRange.y[0] = -imgFigureHHalf;
		Constant.verticalPosRange.y[1] = stageHHalf - imgFigureHHalf * 3;

		this.setState({
			Constant: Constant
		});
	}


	/*
		业务：参数最大值与最小值间随机随一个值
		@pram: max 最大值
		@pram: min 最小值

		@return 返回随机值
	*/

	getRandomNum(max,min){
		return Math.ceil(Math.random() * (max - min) + min);
	}


	getAngle(){
		return (Math.random() > 0.5 ? '+' : '-') + Math.ceil(Math.random() * 30)
	}


	/* 
	 * 业务：重新排列图片布局
	 * 思路：中间图片位置信息直接赋值
	 				上部分图片展示最多 1 张，位置随机生成，相关详见下注释
					左右两侧图片位置信息随机生成
	 */
	rearrange(centerIndex) {
		let imgArrangeArr = this.state.imgArrangeArr,
				Constant = this.state.Constant,
				centerPos = Constant.centerPos,
				horizontalPosRange = Constant.horizontalPosRange,
				hPosRangeLeft = horizontalPosRange.leftSectionX,
				hPosRangeRight = horizontalPosRange.rightSectionX,
				hPosRangeY = horizontalPosRange.y,
				verticalPosRangeX = Constant.verticalPosRange.x, 
				verticalPosRangeY = Constant.verticalPosRange.y,

				centerImgArr = [], //中心图片位置信息
				topArrangImgArr = [], //上侧图片信息
				topImgNum = 0, //上侧图片总数量
				topImgBeginIndex = 0; //上侧图片开始的数组下标

				//中心位置图片设置
				centerImgArr = imgArrangeArr.splice(centerIndex,1);
				centerImgArr[0].pos = centerPos;

				//上侧图片设置 显示零或一张，位置随机
				topImgNum = Math.ceil(Math.random()*2);
				topImgBeginIndex = Math.ceil(Math.random() * (imgArrangeArr.length - topImgNum));
				topArrangImgArr = imgArrangeArr.splice(topImgBeginIndex,topImgNum);
				topArrangImgArr.forEach((item,index)=>{
					imgArrangeArr[index] = {
						pos: {
							left: this.getRandomNum(verticalPosRangeX[0],verticalPosRangeX[1]),
							top: this.getRandomNum(verticalPosRangeY[0],verticalPosRangeY[1])
						},
						rotate: this.getAngle()
					}
				});

				//左右两侧图片设置
				for (var i = 0, j = imgArrangeArr.length, k = j/2; i < j; i++) {
					let lorArr = [];
					if(i < k) {
						lorArr = hPosRangeLeft;
					} else {
						lorArr = hPosRangeRight;
					}

					imgArrangeArr[i] = {
						pos: {
							left: this.getRandomNum(lorArr[0],lorArr[1]),
							top: this.getRandomNum(hPosRangeY[0],hPosRangeY[1])
						},
						rotate: this.getAngle()
					}
				}

				//计算后的结果重新赋值给 state
				imgArrangeArr.splice(centerIndex,0,centerImgArr[0]);

				if(topArrangImgArr && topArrangImgArr[0]) {
					imgArrangeArr.splice(topImgBeginIndex,0,topArrangImgArr[0]);
				}

				this.setState({
					imgArrangeArr: imgArrangeArr
				})
	}

	//组件初始化阶段，组件加载后。。。
	componentDidMount() {
		/*
		 * 业务：计算图片位置
		 * 思路：1. 初始化水平、垂直、中心点
		 *			2. 根据显示区及图片大小，计算水平区域、垂直区域及中心点
		 *			3. 进行图片布局
		 */

		this.getCoordinateRange();
		this.rearrange(0);

	}

	// shouldComponentUpdate(){
	// 	//return true;
	// }

	// componentWillUpdate() {
	// 	this.getCoordinateRange();
	// 	this.rearrange(0);

	// 	console.log('componentWillUpdate');
	// }

  render() {

  	let ImgFigures = [];
		imgDatasArr.forEach((item,index)=>{
			if(!this.state.imgArrangeArr[index]){
				this.state.imgArrangeArr.splice(index,0, {
					pos: {
						left: 0,
						top: 0
					},
					rotate: 0
				});
			}
			ImgFigures.push(<ImgFigure data={item} key={index} range={this.state.imgArrangeArr[index]} imgFigureRef={(imgFigureDom)=>{this.imgFigureDom = imgFigureDom;}} />)
		})

    return (
      <section className="container">
      	<section className="stage" ref={(stage)=>{this.stage = stage}}>
      		{ImgFigures}
      	</section>
      	<nav className="navigator"></nav>
      </section>
    );
  }
};

// defaultProps 只调用一次
// getInitialState 在实例创建时调用一次
AppComponent.defaultProps = {

};

export default AppComponent;
