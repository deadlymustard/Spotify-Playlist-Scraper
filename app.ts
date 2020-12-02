import axios from 'axios';
import fs from 'fs';
import SpotifyWebApi from 'spotify-web-api-node';

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/api/token';
const CLIENT_ID = '<CLIENT_ID>';
const CLIENT_SECRET = '<CLIENT_SECRET>';
const PLAYLIST_QUERY = 'Punk Rock Christmas';
const POPULARITY_THRESHOLD = 9;

let spotifyApi = new SpotifyWebApi();

generateTrackOutputs();

async function generateTrackOutputs() {
    const accessToken = await getAccessToken();
    spotifyApi.setAccessToken(accessToken);

    const allTracks = await getTracksByPlaylistQuery();
    
    // Filter null values and create one mega list
    const flatMappedTracks = allTracks.flatMap(
        track => track.map(track => track.track).filter(track => track.id != null)
    );

    // Map songs by their ID's
    const songById = new Map(
        flatMappedTracks.map(track => [track.id, track] as [string, SpotifyApi.TrackObjectFull])
    );

    // Map song ID by number of appearances in all playlists.
    const rankBySongId = flatMappedTracks
        .reduce((map: any, track) => {
            map[track.id] = (map[track.id]) ? map[track.id] + 1 : 1;
            return map;
        }, {})


    // Sort resulting object by number of appearances (descending)
    const rankBySongIdSorted = Object.keys(rankBySongId)
        .sort((a, b) => rankBySongId[b] - rankBySongId[a])
        .reduce(
            (_sortedObj, key) => ({
                ..._sortedObj,
                [key]: rankBySongId[key],
            }),
            {}
        ) as { [s: string]: number; };

    writeOutputJson(songById, rankBySongIdSorted);
    writePlaylistTextFile(songById, rankBySongIdSorted);
}

function writeOutputJson(
    songById: Map<string, SpotifyApi.TrackObjectFull>, 
    rankBySongId: { [s: string]: number; }
) {
    const jsonOutput = Object.entries<number>(rankBySongId)
    .filter(entry => entry[1] >= POPULARITY_THRESHOLD)
    .map(entry  => {
        return buildTrackJson(entry[1], songById.get(entry[0]) as SpotifyApi.TrackObjectFull);
    });

    console.log(jsonOutput);
    fs.writeFileSync('output.json', JSON.stringify(jsonOutput));
}

function writePlaylistTextFile(
    songById: Map<string, SpotifyApi.TrackObjectFull>, 
    rankBySongId: { [s: string]: number; }
) {
    const playListUris = Object.entries<number>(rankBySongId)
    .filter(entry => entry[1] >= POPULARITY_THRESHOLD)
    .map(entry  => {
        return songById.get(entry[0])?.uri
    })
    fs.writeFileSync('playlist.txt', playListUris.join('\n'), 'utf-8');
}


async function getTracksByPlaylistQuery(): Promise<SpotifyApi.PlaylistTrackObject[][]> {
    const playlistIds = await spotifyApi.searchPlaylists(PLAYLIST_QUERY, { limit: 50 }).then((searchResponse) => {
        return searchResponse.body.playlists?.items.map((playlist) => playlist.id);
    })
    const playListRequest = playlistIds?.map((playListId) => {
        return spotifyApi.getPlaylist(playListId, { fields: "tracks"} ).then((playlist) => playlist.body.tracks.items);
    }) as Promise<SpotifyApi.PlaylistTrackObject[]>[];

    return Promise.all(playListRequest);
}

function buildTrackJson(rank: number, track: SpotifyApi.TrackObjectFull): any {
    return {
        count: rank,
        track: track.name,
        artist: track.artists[0].name,
        album: track.album.name
    }
}

function getAccessToken() {
    return axios({
        method: 'post',
        url: SPOTIFY_AUTH_URL,
        params: {
            grant_type: 'client_credentials'
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'            
        },
        auth: {
            username: CLIENT_ID,
            password: CLIENT_SECRET
        }
    }).then(body => body.data.access_token)
}
