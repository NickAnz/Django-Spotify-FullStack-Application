import React, {Component} from 'react';
import {Grid, Button, Typography} from "@material-ui/core";
import CreateRoomPage from './CreateNewRoom'
import MusicPlayer from "./MusicPlayer";


export default class Room extends Component {
    constructor(props) {
        super(props);
        this.state = {
            votesToSkip: 2,
            guestCanPause: false,
            isHost: false,
            showSettings: false,
            spotifyAuthenticated: false,
            song: {}
        };
        /*This tells us what the matched parameter is in the props so we can access it so this is
        where the room code in the URLS comes into play  */

        this.roomCode = this.props.match.params.roomCode;
        this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
        this.updateShowSettings = this.updateShowSettings.bind(this);
        this.renderSettingsButton = this.renderSettingsButton.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
        this.getRoomDetails = this.getRoomDetails.bind(this);
        this.authenticateSpotify = this.authenticateSpotify.bind(this);
        this.getCurrentSong = this.getCurrentSong.bind(this);
        this.getRoomDetails();
        this.getCurrentSong();
    }

    // this will poll the spotify endpoint every second
    componentDidMount() {
        this.interval = setInterval(this.getCurrentSong,1000)
    }

    //when the component is gone we need to remove this interval
    componentWillUnmount() {
        clearInterval(this.interval);
    }


    getRoomDetails() {
        // Fetches from the URL to return the corrected data
        // Checking to ensure that the room is valid. If it is not it returns to the home screen "/"
        // if it is valid we return the response.json() and continue with .this
        fetch('/api/get-room' + '?code=' + this.roomCode)
            .then((response) => {
                if(!response.ok){
                    this.props.leaveRoomCallback();
                    this.props.history.push("/");
                }
                return response.json();
            })
            .then(data => {
                this.setState({
                    votesToSkip: data.votes_to_skip,
                    guestCanPause: data.guest_can_pause,
                    isHost: data.is_host
                });
                if (this.state.isHost){
                    this.authenticateSpotify();
                }
            })
    }

    authenticateSpotify(){
        // checking to see if the user is authenticated
        fetch('/spotify/is-authenticated')
            .then((response) => response.json())
                .then((data) => {
                    this.setState({spotifyAuthenticated: data.status});
                    console.log(data.status)
                    if (!data.status) {
                        fetch('/spotify/get-auth-url')
                            .then((response) => response.json())
                            .then((data) => {
                                window.location.replace(data.url);
                            });
                    }
                })
    }

    //In charge of calling the current song endpoint and updating the song info
    getCurrentSong(){
        fetch('/spotify/current-song')
            .then((response) =>{
                if (!response.ok){
                    return {};
                }
                else{
                    return response.json();
                }
            })
            .then((data)=> {
            this.setState({song:data});

    })
    }

    updateShowSettings(value)
    {
        this.setState({
            showSettings: value
        })
    }

    //This will basically render the settings page, when you hit close it will basically remove this render settings page
    // From the screen
    renderSettings()
    {
        return(
        <Grid container spacing={1} align={"center"}>
            <Grid item xs={12}>
                <CreateRoomPage
                    update={true}
                    votesToSkip={this.state.votesToSkip}
                    guestCanPause={this.state.guestCanPause}
                    roomCode={this.roomCode}
                    updateCallback={this.getRoomDetails}/>
            </Grid>
            <Grid item xs={12}>
                <Button variant={"contained"}
                        color={"secondary"}
                        onClick={() => this.updateShowSettings(false)}>
                    Close
                </Button>
            </Grid>
        </Grid>
        )
    }

    // Used to only display the settings button if they are a host
    // 12!
    renderSettingsButton(){
        return (
            <Grid item xs={12} align={"center"}>
                <Button variant={"contained"}
                        color={"primary"}
                        onClick={() => this.updateShowSettings(true)}>
                    Settings
                </Button>
            </Grid>
        );
    }

    //Will call and endpoint which will tell us to leave the room
    leaveButtonPressed(e)
    {
        //So here we are saying that when this is all complete and it has been removed from the sever
        //We then migrate back to the main page
        const requestOptions ={
            method: "POST",
            headers: {"Content-Type" : "application/json"}
        }
        fetch('/api/leave-room',requestOptions)
            .then((response) => {
                this.props.leaveRoomCallback();
                this.props.history.push('/');
            })
    }


    render() {
        if (this.state.showSettings)
        {
            return this.renderSettings();
        }
        return (

            <Grid container spacing={1} align={"center"} className={"musicPlayer"}>
                <Grid item xs={12}>
                    <Typography variant={"h4"} component={"h4"}>
                        Code: {this.roomCode}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    {<MusicPlayer {...this.state.song}/>}
                </Grid>

                {this.state.isHost ? this.renderSettingsButton(): null}
                <Grid item xs={12}>
                    <Button color={"secondary"} variant={"contained"} onClick={this.leaveButtonPressed}>
                        Leave Room
                    </Button>
                </Grid>

            </Grid>

        );
    }
}
/*
            <div>
                <h3>{this.roomCode}</h3>
                <p>Votes: {this.state.votesToSkip}</p>
                <p>Guest Can Pause: {this.state.guestCanPause.toString()}</p>
                <p>Host: {this.state.isHost.toString()}</p>
            </div>
 */