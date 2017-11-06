import React, { Component } from 'react';

import './evolution.less'
import './Game'

class GA extends Component {
    constructor(props) {
        super(props);
        this.seeds = []  //保存所有个体
        if(props.capacity){
            this.seeds.length = props.capacity;
            for(let i = 0;i<this.seeds.length;i++){
                this.seeds[i] = {
                    alpha:Math.random()*0.4 - 0.2,  //生成-0.2—0.2的随机值
                    beta:Math.random()*0.4-0.2,
                    game:Math.random()*0.4-0.2,
                    delta:Math.random()*0.4-0.2,
                    fitness:Number.NEGATIVE_INFINITY //适应值，能跑的最多的块
                }
            }
        }else{
            let alpha = props.a || 2;
            let beta = props.b || 2;
            let gama = props.c || 2;
            let delta = props.d || 2;

            for(let a=-alpha;a<alpha;a++){
                for(let b=-beta;b<beta;b++){
                    for(let c=-gama;c<gama;c++){
                        for(let d=-delta;d<delta;d++){
                            this.seeds.push(GA.normalize({
                                alpha:a,
                                beta:b,
                                gama:c,
                                delta:d,
                                fitness:Number.NEGATIVE_INFINITY
                            }))
                        }
                    }
                }
            }
        }
        this.state = {
            capacity:this.seeds.length,
            index:0,                //当前测试个体
            etime:0,
            current:this.seeds[0],
            max:{
                fitness:0         //当前的最大适应值
            }
        }
    }

    //随机seeds
    static normalize(ge){
        let normal = Math.sqrt(ge.alpha*ge.alpha
                                +ge.beta*ge.beta
                                +ge.gama*ge.game
                                +ge.delta*ge.delta)
        if(normal === 0) normal = 1;
        ga.alpha = ge.alpha / normal;
        ge.bete = ge.beta / normal;
        ge.gama = ge.gama / normal;
        ge.delta = ge.delta / normal;
        return ge;
    }

    //杂交
    static crossOver(seed1,seed2){
        let a1 = seed1.fitness / (seed1.fitness + seed2.fitness);//计算seed1的杂交权重
        let a2 = seed2.fitness / (seed1.fitness + seed2.fitness);//计算seed2的杂交权重
        let newSeed = {
            alpha : al * seed1.alpha + a2 * seed2.alpha,
            beta: a1 * seed1.beta + a2 * seed2.beta,
            gama: a1 * seed1.gama + a2 * seed2.gama,
            delta:a1 * seed1.delta + a2 * seed.delta
        }
        return newSeed;
    }

    //突变
    multate(seed){
        let d = Math.random() - 0.5;
        let r = parseInt(Math.random()*4)
        //随机选择一项进行突变
        switch(r){
            case 0:
                seed.alpha += d;
                break;
            case 1:
                seed.beta += d;
                break;
            case 2:
                seed.gama += d;
                break;
            case 3:
                seed.delta += d;
                break;
        }
        return seed;
    }

    //进化
    evolution(){
        //按照适应值大小从大到小对seed进行排序
        this.seeds.sort((a,b)=>{return b.fitness - a.fitness;})

        //保存最大项
        if(this.state.max.fitness<this.seeds[0].fitness){
            this.setState({
                max:JSON.parse(JSON.stringify(this.seeds[0]))
            })
        }
        
        //取前60%的个体
        let capacity = parseInt(this.seeds.length*0.6)
        this.seeds.length = capacity;
        this.setState({
            capacity:capacity
        })
        if(capacity<3){
            return false;
        }
        
        for(let i=this.seeds.length-1;i>=0;i--){
            let x = parseInt(Math.random()/10*this.seeds.length)
            //取前10分之1
            this.seeds[i] = GA.crossOver(this.seeds[i],this.seeds[x]);
            //随机突变
            if(Math.random()<0.05){
                this.multate(this.seeds[i])
            }
        }
    }

    //进行下一个个体
    next(){
        let seed = this.seeds[this.state.index++]
        if(this.state.index == this.seeds.length){
            this.state.etime++;
            this.setState({
                current:seed,
                index:0,
                etime:this.state.etime
            })
            if(this.evolution()===false){
                return false;
            }
        }else{
            this.setState({
                index:this.state.index,current:seed
            })
        }
        return seed;
    }
    render() {
        return (
            <section>
                <table className = 'training'>
                    <thead><tr><th>项</th><th>值</th></tr></thead>
                    <caption>训练详情</caption>
                </table>
                <tbody>
                    <tr><td>当前种群大小</td><td>{this.state.length}</td></tr>
                    <tr><td>当前测试个体</td><td>{this.state.index}</td></tr>
                    <tr><td>进化次数</td><td>{this.state.etime}</td></tr>
                    <tr><td>当前最大fitness</td><td>{this.state.max.fitness}</td></tr>
                    <tr><td>alpha</td><td>{this.state.max.alpha}</td></tr>
                    <tr><td>beta</td><td>{this.state.max.bete}</td></tr>
                    <tr><td>gama</td><td>{this.state.max.gama}</td></tr>
                    <tr><td>delta</td><td>{this.state.max.delta}</td></tr>
                </tbody>
                <tbody>
                    <tr><td>当前alpha</td><td>{this.state.current.alpha}</td></tr>
                    <tr><td>当前beta</td><td>{this.state.current.beta}</td></tr>
                    <tr><td>当前gama</td><td>{this.state.current.gama}</td></tr>
                    <tr><td>当前delta</td><td>{this.state.current.delta}</td></tr>
                </tbody>
            </section>
        );
    }
}


//
let GACallBack = (ga)=>{
    return function(state){
        if(this.ai.seed){
            this.ai.seed.fitness = state.total;
            if(this.ai.seed.fitness > ga.state.max.fitness){
                ga.setState({
                    max:this.ai.seed
                })
            }
        }
        let seed = ga.next()
        
        if(seed === false){
            console.log('trainning finish!');
            return;
        }
        this.ai.alpha = seed.alpha;
        this.ai.beta = seed.beta;
        this.ai.gama = seed.gama;
        this.ai.delta = seed.delta;
        this.ai.seed = seed;

        this.status = 1;
        this.dropNew();
    }
}

let ga = ReactDOM.render(<GA capacity={1000}/>,document.getElementById('Training'))

let game = ReactDOM.render(<GAME disableMode={true}
                                onGameOver = {GACallBack(ga)}
                                aiSeed = {ga.next()}
                                aiInterval={0.01}
                            />, document.getElementById('app'))