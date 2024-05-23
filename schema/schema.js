const graphql = require('graphql');

const { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull } = graphql;

const Movies = require('../models/movie');
const Directors = require('../models/director');

/*

const directorsJson = [
  { "name": "Quentin Tarantino", "age": 55 }, // 60ba21f35d98a6135a9c6150
  { "name": "Michael Radford", "age": 72 }, // 60ba22cf5d98a6135a9c6152
  { "name": "James McTeigue", "age": 51 }, // 60ba22f55d98a6135a9c6153
  { "name": "Guy Ritchie", "age": 50 }, // 60ba23105d98a6135a9c6154
];

const directorsJson = [
  { "name": "Pulp Fiction", "genre": "Crime", "directorId": },
  { "name": "1984", "genre": "Sci-Fi", "directorId": }, // 60ba23365d98a6135a9c6155
  { "name": "V for vendetta", "genre": "Sci-Fi-Triller", "directorId": },
  { "name": "Snatch", "genre": "Crime-Comedy", "directorId": },
  { "name": "Reservoir Dogs", "genre": "Crime", "directorId": },
  { "name": "The Hateful Eight", "genre": "Crime", "directorId": },
  { "name": "Inglourious Basterds", "genre": "Crime", "directorId": },
  { "name": "Lock, Stock and Two Smoking Barrels", "genre": "Crime-Comedy", "directorId": },
];

const movies = [
  { id: '1', name: 'Pulp Fiction', genre: 'Crime', directorId: '1' },
  { id: '2', name: '1984', genre: 'Sci-Fi', directorId: '2' },
  { id: '3', name: 'V for vendetta', genre: 'Sci-Fi-Triller', directorId: '3' },
  { id: '4', name: 'Snatch', genre: 'Crime-Comedy', directorId: '4' },
  { id: '5', name: 'Reservoir Dogs', genre: 'Crime', directorId: '1' },
  { id: '6', name: 'The Hateful Eight', genre: 'Crime', directorId: '1' },
  { id: '7', name: 'Inglourious Basterds', genre: 'Crime', directorId: '1' },
  { id: '8', name: 'Lock, Stock and Two Smoking Barrels', genre: 'Crime-Comedy', directorId: '4' },
];

const directors = [
  { id: '1', name: 'Quentin Tarantino', age: 55 },
  { id: '2', name: 'Michael Radford', age: 72 },
  { id: '3', name: 'James McTeigue', age: 51 },
  { id: '4', name: 'Guy Ritchie', age: 50 },
];

*/

const MovieType = new GraphQLObjectType({
  name: 'Movie',
  fields: () => ({   // треба юзати ф-цію, бо інакше в даному випадку DirectorType буде не доступно, бо воно об'явлено нижче
    id: { type: GraphQLID },
    name: { type: new GraphQLNonNull(GraphQLString) },
    genre: { type: new GraphQLNonNull(GraphQLString) },
    director: {   // Не просто звичайне поле, а зв'язок між колекціями
      type: DirectorType,
      resolve(parent, args) {
        //return directors.find(director => director.id == parent.id)
        return Directors.findById(parent.directorId);
      }
    }
  }),
});

const DirectorType = new GraphQLObjectType({
  name: 'Director',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: new GraphQLNonNull(GraphQLString) },
    age: { type: new GraphQLNonNull(GraphQLInt) },
    movies: {
      type: new GraphQLList(MovieType),
      resolve(parent, args) {
        //return movies.filter(movie => movie.directorId === parent.id)
        return Movies.find({ directorId: parent.id });
      },
    },
  }),
});

// Існує всього 2 типи запитів: Query та Mutation, перше для отримання даних, а друге - додавання, видалення, зміна

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addDirector: {
      type: DirectorType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve(parent, args) {
        const director = new Directors({
          name: args.name,
          age: args.age,
        });
        return director.save(); // Добре повертати результат операції, щоб бачити чи все ок виконалось
      }
    },
    addMovie: {
      type: MovieType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(GraphQLString) },
        directorId: { type: GraphQLID },
      },
      resolve(parent, args) {
        const movie = new Movies({
          name: args.name,
          genre: args.genre,
          directorId: args.directorId,
        });
        return movie.save();
      }
    },
    deleteDirector: {
      type: DirectorType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Directors.findByIdAndRemove(args.id);
      }
    },
    deleteMovie: {
      type: MovieType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Movies.findByIdAndRemove(args.id);
      }
    },
    updateDirector: {
      type: DirectorType,
      args: {
        id: { type: GraphQLID },
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve(parent, args) {
        return Directors.findByIdAndUpdate(
          args.id,
          { $set: { name: args.name, age: args.age } },
          { new: true },
        );
      }
    },
    updateMovie: {
      type: MovieType,
      args: {
        id: { type: GraphQLID },
        name: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(GraphQLString) },
        directorId: { type: GraphQLID },
      },
      resolve(parent, args) {
        return Movies.findByIdAndUpdate(
          args.id,
          { $set: { name: args.name, genre: args.genre, directorId: args.directorId } },
          { new: true },
        );
      }
    },
  }
});

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    movie: {
      type: MovieType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        //return movies.find(movie => movie.id == args.id);
        return Movies.findById(args.id);
      }
    },
    movies: {
      type: new GraphQLList(MovieType),
      resolve(parent, args) {
        //return movies;
        return Movies.find({});
      }
    },
    director: {
      type: DirectorType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        //return directors.find(director => director.id == args.id);
        return Directors.findById(args.id);
      }
    },
    directors: {
      type: new GraphQLList(DirectorType),
      resolve(parent, args) {
        //return directors;
        return Directors.find({});
      }
    },
  },
});

module.exports = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});
