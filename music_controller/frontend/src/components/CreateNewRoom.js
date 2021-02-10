import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    Button, Grid, Typography,
    TextField, FormControl,
    FormHelperText, Radio,
    RadioGroup, FormControlLabel}
    from '@material-ui/core'
import {Link} from "react-router-dom"
import {Collapse} from "@material-ui/core";
import {Alert} from "@material-ui/lab";


export default class CreateNewRoom extends Component {
    //this defines the original variables for the props of the component
    static defaultProps = {
        votesToSkip: 2,
        guestCanPause: true,
        update: false,
        roomCode: null,
        updateCallback: () => {}
    }

    constructor(props) {
        super(props);
        this.state = {
            guestCanPause: this.props.guestCanPause,
            votesToSkip: this.props.votesToSkip,
            errorMsg: "",
            successMsg:""
        };

        /* this statement allows you to use "this" inside the button function
         You can also use an arrow function when calling the function to ignore this statement*/
        this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this);
        this.handleGuestCanPauseChange = this.handleGuestCanPauseChange.bind(this);
        this.handleUpdateButtonPressed = this.handleUpdateButtonPressed.bind(this);
        {/* The handleVotes changed is not bound as iv written an arrow function to show its functionality */}
    }

    handleVotesChanged(e){
        this.setState({votesToSkip: e.target.value});
    }

    handleGuestCanPauseChange(e){
        this.setState({guestCanPause: e.target.value === 'true' ? true: false})
    }


    handleRoomButtonPressed()
    {
        {/*This is basically setting up what type of data we are trying to send */}
        const requestOptions ={
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            mode:"cors",
            body: JSON.stringify({
                votes_to_skip: this.state.votesToSkip,
                guest_can_pause: this.state.guestCanPause
            })
        };
        {/*This is then the main fetch command with the content */}
        fetch('/api/create-room',requestOptions)
            .then((response) => response.json())
            .then((data) => this.props.history.push('/room/' + data.code));
    }

    handleUpdateButtonPressed()
    {
        /*This is basically setting up what type of data we are trying to send */
        const requestOptions ={
            method: 'PATCH',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                guest_can_pause: this.state.guestCanPause,
                votes_to_skip: this.state.votesToSkip,
                code: this.props.roomCode
            })
        };
        {/*This is then the main fetch command with the content */}
        fetch('/api/update-room',requestOptions)
            .then((response) => {
                if (response.ok){
                    this.setState({
                        successMsg: "Room Updated Successfully!"
                    })
                }
                else{
                    this.setState({
                        errorMsg: "Error Updating Room...."
                    })

                }
                this.props.updateCallback();
            })


    }

    renderCreatebuttons()
    {
        return(
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Button color={"primary"} variant={"contained"} onClick={this.handleRoomButtonPressed}>
                        Create A Room
                    </Button>
                </Grid>
                <Grid item xs={12} align="center">
                    {/* the component section here is basically saying that it will act as a link */}
                    <Button color={"secondary"} variant={"contained"} to={"/"} component={Link}>
                        Back
                    </Button>
                </Grid>
            </Grid>
    );
    }

    renderUpdateButtons()
    {
        return(
            <Grid item xs={12} align="center">
                    <Button color={"primary"} variant={"contained"} onClick={this.handleUpdateButtonPressed}>
                        Update Room
                    </Button>
                </Grid>
        )
    }
    //if there is an error message or success message show the collapse
    render() {
        const title = this.props.update ? "Update Room" : "Create Room";

        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Collapse in={this.state.errorMsg != "" || this.state.successMsg != ""}>
                        {this.state.successMsg != "" ? (
                                <Alert
                                    severity={"success"}
                                    onClose={() => {
                                        this.setState({successMsg:""});
                                    }}
                                >
                                    {this.state.successMsg}
                                </Alert>
                        ) : (
                                <Alert
                                    severity={"error"}
                                    onClose={() => {
                                        this.setState({errorMsg:""});
                                       }}
                                >
                                    {this.state.errorMsg}
                                </Alert>
                            )}
                    </Collapse>
                </Grid>
                <Grid item xs={12} align="center">
                    <Typography component={"h4"} variant={"h4"}>
                        {title}
                    </Typography>
                </Grid>
                 <Grid item xs={12} align="center">
                     {/*Everything in the FormControl Section of this is one selection */}
                    <FormControl component={"fieldset"}>
                        <FormHelperText>
                            <div align={"center"}>
                                Guest Control Of Playback State
                            </div>
                        </FormHelperText>
                        <RadioGroup row defaultValue={this.props.guestCanPause.toString()} onChange={this.handleGuestCanPauseChange}>
                            <FormControlLabel control={<Radio color={"primary"}/>} label={"Play/Pause"} value={"true"} labelPlacement={"bottom"}>

                            </FormControlLabel>
                            <FormControlLabel control={<Radio color={"secondary"}/>} label={"No Control"} value={"false"} labelPlacement={"bottom"}>

                            </FormControlLabel>
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12} align="center">
                    <FormControl>
                        {/*The input props here tells the system that we have to have a min amount of votes to skip
                        so basically its the minimum value of the text field */}
                        <TextField required={true}
                                   type={"number"}
                                   defaultValue={this.state.votesToSkip}
                                   inputProps={{
                                       min:1,
                                       style:{textAlign:"center"}
                                   }}

                                   onChange={(e) => this.setState({votesToSkip: e.target.value})}
                        />
                        <FormHelperText>
                            <div align={"center"}>
                                Votes Required To Skip Song
                            </div>
                        </FormHelperText>
                    </FormControl>
                </Grid>
                {this.props.update ? this.renderUpdateButtons() : this.renderCreatebuttons()}
            </Grid>
        );
    }
}
