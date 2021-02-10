
import React, { Component } from "react";
import RoomJoin from "./RoomJoin";
import CreateNewRoom from"./CreateNewRoom";
import Room from "./Room";
import {Grid, Button, ButtonGroup, Typography} from "@material-ui/core";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";

{/* the /room/:roomCode refers to a dynamic address which is used
to access various pages depending on the code */}
export default class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state= {
      roomCode: null
    }

    this.clearRoomCode = this.clearRoomCode.bind(this)
  }

  // If the user was in a room previously we want to put them back, this is what
  // the session caching data is for. async is because we are using an async function inside the function
  // This will call an endpoint to see if a user is in a room so we want to wait for the
  // function to complete before we continue
  async componentDidMount() {
    fetch('/api/user-in-room')
        .then((response) => response.json())
        .then((data) => {
          this.setState({
            roomCode: data.code
          })
        })
  }


  /* Button Group means that the buttons render horizontally */
  renderHomePage()
  {
    return (
      <Grid container spacing={3} align={"center"}>
        <Grid item xs={12}>
          <Typography variant={"h3"} component={"h3"} className={"title"}>
            House Party
          </Typography>
        </Grid>
        <Grid item xs={12}>

          <ButtonGroup disableElevation variant={"contained"} color={"primary"}>
            <Button color={"primary"} to={'/join'} component={Link} className={"button"}> Join A Room</Button>
            <Button color={"secondary"} to={'/create'} component={Link} className={"button"} > Create A Room</Button>
          </ButtonGroup>

        </Grid>

      </Grid>
    );
  }

  //This will remove the room code when we leave a room
  clearRoomCode()
  {
    this.setState({
      roomCode:null
    })
  }

  // Route render means that we will change the item depending on specific properties
  // The ? represents a conditional statement so we are checking if a roomCode is not null
  // This will determine which component we render
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/"  render={() => {
            return this.state.roomCode ? (<Redirect to={`/room/${this.state.roomCode}`}/>) : this.renderHomePage()
          }}/>
          <Route path="/join" component={RoomJoin} />
          <Route path="/create" component={CreateNewRoom} />
          <Route path="/room/:roomCode" render={(props)=>{
            return <Room {...props} leaveRoomCallback={this.clearRoomCode} />
          }} />
        </Switch>
      </Router>
    );
  }
}