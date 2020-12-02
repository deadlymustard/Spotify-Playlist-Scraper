# Spotify Playlist Generator
A node script that pulls playlists from Spotify matching an initial search query and generates a report of the
top songs across all playlists.

I made this primarily so I could find popular songs that I was missing from other people's playlists easily.

Here's an example playlist I generated using this method:
https://open.spotify.com/playlist/5KG2ApATyizqjpdXyY8Byx?si=-R-WeS0uQTa7bt_kjT7BWw

## Usage Instructions
1. Create an application in the Spotify Dashboard (https://developer.spotify.com/dashboard/applications)
2. Modify `app.ts` to include your `CLIENT_ID` and `CLIENT_SECRET` from your created Spotify application (https://developer.spotify.com/dashboard/applications/<appId>)
3. Modify `PLAYLIST_QUERY` with your desired query. 
4. Modify `POPULARITY_THRESHOLD` to determine the minimum number of appearances a song must have before it returns in the results.
5. Run `ts-node app.ts`

The application will generate an `output.json` file detailing the songs it found. It will also a generate a `playlist.txt`.

## Creating A Playlist
Using `playlist.txt` you can very easily create a playlist in Spotify.

To import the playlist into Spotify:
1. Copy the content of `playlist.txt` to your clipboard.
2. Create a new playlist in Spotify: Choose File -> New Playlist (Ctrl + N).
3. Paste into the playlist: Select the playlist and choose Edit -> Paste (Ctrl + V).

## Notes
- Playlist queries are limited to 50 by default. 
