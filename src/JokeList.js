import React, { Component } from "react";
import Joke from "./Joke"
import axios from 'axios';
import { v4 as uuid } from 'uuid'
import "./JokeList.css";


class JokeList extends Component {
    static defaultProps = {
        numJokesToGet: 15
    }
    constructor(props) {
        super(props);
        this.state = {
            jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
            loading: false
        };
        this.seenJokes = new Set(this.state.jokes.map(j => j.text))
        this.handleVote = this.handleVote.bind(this);
        this.handleClick = this.handleClick.bind(this)
    }
    componentDidMount() {
        if(this.state.jokes.length === 0) {
            this.setState({loading: true}, this.getJokes)
        }
    }
    async getJokes(){
        try{
            let jokes = [];
            while (jokes.length < this.props.numJokesToGet) {
                let res = await axios.get('https://icanhazdadjoke.com/', {
                    headers: {
                        Accept: 'application/json'
                    }
                });
                if(!this.seenJokes.has(res.data.joke))
                    jokes.push({ id: uuid(), text: res.data.joke, votes: 0 })
                else 
                    console.log('There is duplication of joke');
            }
            this.setState(st => ({
                jokes: [...st.jokes, ...jokes],
                loading: false
            }), () => {
                window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
            })
        } catch(e) {
            alert(e)
            this.setState({loading: false})
        }
        
        
    }

    handleVote(id, delta) {
        this.setState(st => ({
            jokes: st.jokes.map(j => j.id === id ? { ...j, votes: j.votes + delta } : j)
        }), () => {
            window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
        })
    }

    handleClick(){
        this.setState({loading: true}, this.getJokes);
    }

    render() {
        if(this.state.loading){
            return(
                <div className="JokeList-spinner">
                    <i className="far fa-8x fa-laugh fa-spin"></i>
                    <h1 className="JokeList-title">
                        Loading...
                    </h1>
                </div>
            )
        }
        return (
            <div className="JokeList">
                <div className="JokeList-sidebar">
                    <h1 className="JokeList-title">
                        <span>Dad</span> Jokes
                    </h1>
                    <img
                        src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"
                        alt=""
                    />
                    <button className="JokeList-getmore" onClick={this.handleClick}>New Jokes</button>
                </div>
                <div className="JokeList-jokes">
                    {this.state.jokes.map(j => {
                        return <Joke className='Joke'
                            key={j.id}
                            votes={j.votes}
                            text={j.text}
                            upvote={() => this.handleVote(j.id, 1)}
                            downvote={() => this.handleVote(j.id, -1)}
                        />
                    })}
                </div>
            </div>
        )
    }
}

export default JokeList;
