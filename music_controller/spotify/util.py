from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from .credentials import CLIENT_SECRET, CLIENT_ID
from requests import post, put, get

BASE_URL = "https://api.spotify.com/v1/me/"


# Check to see if the user has any tokens already
def get_user_tokens(session_id):
    user_tokens = SpotifyToken.objects.filter(user=session_id)
    print(user_tokens)
    if user_tokens.exists():
        return user_tokens[0]
    return None

# This will save the token or update and existing session
def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    tokens = get_user_tokens(session_id)
    # Comes in within seconds (3600) so were going to add 1 hour to the current time
    expires_in = timezone.now() + timedelta(seconds=expires_in)
    # If a token Exists
    if tokens:
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.expires_in = expires_in
        tokens.token_type = token_type
        tokens.save(update_fields=['access_token', 'refresh_token', 'expires_in', 'token_type' ])
    else:
        tokens = SpotifyToken(user=session_id, access_token=access_token,
                              refresh_token=refresh_token, token_type=token_type, expires_in=expires_in)
        tokens.save()

def is_spotify_autheticated(session_id):
    tokens = get_user_tokens(session_id)
    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now():
            refresh_spotify_token(tokens)

        return True

    return False

def refresh_spotify_token(session_id):
   refresh_token = get_user_tokens(session_id).refresh_token

    # This will refresh the spotify token and return a response which we will then update
   response = post('https://accounts.spotify.com/api/token', data = {
       'grant_type': 'refresh_token',
       'refresh_token': refresh_token,
       'client_id': CLIENT_ID,
       'client_secret': CLIENT_SECRET
   }).json()

   access_token = response.get('access_token')
   token_type = response.get('token_type')
   expires_in = response.get('expires_in')


   update_or_create_user_tokens(session_id, access_token,token_type, expires_in, refresh_token)


def execute_spotify_api_request(session_id, endpoint, post_=False, put_=False):
    tokens = get_user_tokens(session_id)
    # The bearer call is required to first set this access token
    headers = {'Content-Type': 'application/json',
               'Authorization': "Bearer " + tokens.access_token}

    if post_:
        post(BASE_URL + endpoint, headers=headers)
    if put_:
        put(BASE_URL + endpoint, headers=headers)

    response = get(BASE_URL + endpoint, {}, headers=headers)

    try:
        return response.json()
    except:
        return {'Error': 'Issue with request'}

def play_song(session_id):
    return execute_spotify_api_request(session_id, "player/play", put_=True)

def pause_song(session_id):
    return execute_spotify_api_request(session_id, "player/pause", put_=True)

def skip_song(session_id):
    return execute_spotify_api_request(session_id, "player/next", post_=True)