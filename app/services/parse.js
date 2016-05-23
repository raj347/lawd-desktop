import Parse from 'parse/node'
import _ from 'underscore'

const MOVIES_PARSE_ENDPOINT = 'http://149.202.45.9/parse/hammamet/classes/Movie'

Parse.initialize('88c22318aaeda928f5a9748884203f6b6c1a6d46');
Parse.serverURL = 'http://149.202.45.9/parse/streaming'

export default class DataService {

  // options are sort, skip and query
  getShowsFromParse (options) {
    var Show = Parse.Object.extend(options.type);
    var mainQuery = new Parse.Query(Show);

    console.log(options)

    mainQuery.limit(options.show)
    mainQuery.skip(options.skip)
    mainQuery.exists('plot')
    mainQuery.notEqualTo('poster', 'N/A')

    if(options.searchQuery) {
      var queryEqualName = new Parse.Query(Show)
      queryEqualName.contains('nameLowCase', (options.searchQuery).toLowerCase())

      var queryContainActors = new Parse.Query(Show)
      queryContainActors.contains('actors', options.searchQuery)

      var queryEqualID = new Parse.Query(Show)
      queryEqualID.equalTo('imdbID', options.searchQuery)

      mainQuery = Parse.Query.or(queryEqualName, queryContainActors, queryEqualID)

      return mainQuery.find().then(function(results) {
        return results
      });
    } else {
      if(options.sort == 'popular') {
        mainQuery.descending('released')
        mainQuery.greaterThan('imdbVotes', 100)
      }

      if(options.sort == 'imdbRating') {
        mainQuery.descending('imdbRating')
      }

      if(options.filter !== '') {
        mainQuery.contains('genre', (options.filter).capitalizeFirstLetter())
      }

      return mainQuery.find().then(function(results) {
        return results
      });
    }
  }

  getTVEpisodesFromParse(id) {
    var tv = new Parse.Object('TV');
    tv.id = id;

    var TVEpisode = Parse.Object.extend('TVEpisode')
    var query = new Parse.Query(TVEpisode)
    query.equalTo('parent', tv)
    query.descending('name')

    return query.find().then(function(results) {
      var groups =  _.groupBy(results, function(r) {
        return r.get('season')
      });
      return groups
    })
  }

  getShowFromParse(id, type) {
    var Show = Parse.Object.extend(type)
    var query = new Parse.Query(Show)

    return query.get(id).then(function(result) {
      return result
    })
  }

  getCuratedListFromParse() {
    var CuratedList = Parse.Object.extend('CuratedList')
    var query = new Parse.Query(CuratedList)
    query.include("movies")

    return query.find().then(function(results) {
      return results
    });
  }
}