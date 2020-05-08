const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = async (client, config) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        hashtag,
        usersCountToFollow,
        likesCountToLike,
        comment,
        mode,
      } = config;

      const photos = await client.getPhotosByHashtag({ hashtag });
      const dataList = await photos.hashtag.edge_hashtag_to_media.edges.map(
        (med) => (mode === "follow" ? med.node.owner.id : med.node.id)
      );
      const uniqueDataList = [...new Set(dataList)];

      if (mode === "follow") {
        let count = 0;
        uniqueDataList.slice(0, usersCountToFollow).forEach(async (userId) => {
          (async (userId) => {
            setTimeout(async () => {
              await client.follow({ userId });
              if (count === usersCountToFollow - 1) resolve(true);
              else count++;
            }, getRandomInt(1000, 20000));
          })(userId);
        });
      } else {
        let count = 0;
        uniqueDataList.slice(0, likesCountToLike).forEach(async (mediaId) => {
          (async (userId) => {
            setTimeout(async () => {
              await client.like({ mediaId });
              if (comment) await client.addComment({ mediaId, text: comment });
              if (count === likesCountToLike - 1) resolve(true);
              else count++;
            }, getRandomInt(1000, 20000));
          })(userId);
        });
      }
    } catch (err) {
      reject(err);
    }
  });
};
