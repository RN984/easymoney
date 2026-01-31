module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // これがアニメーションを動かすために必須です
      'react-native-reanimated/plugin', 
    ],
  };
};