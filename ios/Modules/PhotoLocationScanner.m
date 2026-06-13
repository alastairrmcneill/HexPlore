#import "PhotoLocationScanner.h"
#import <Photos/Photos.h>

@implementation PhotoLocationScanner

RCT_EXPORT_MODULE()

// Run on a background thread — PHAsset enumeration must not block the main queue.
- (dispatch_queue_t)methodQueue {
  return dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

/**
 * Returns all geotagged photos as [{id, lat, lng, createdAt}].
 *
 * Reads PHAsset.location directly from the iOS Photos database — no image
 * files are opened, so the entire library is enumerated in < 2 seconds
 * regardless of library size.
 *
 * @param sinceMs  Unix timestamp in ms. Pass 0 to return all photos.
 */
RCT_EXPORT_METHOD(getLocations:(double)sinceMs
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  PHFetchOptions *options = [[PHFetchOptions alloc] init];
  options.includeHiddenAssets = NO;

  if (sinceMs > 0) {
    NSDate *since = [NSDate dateWithTimeIntervalSince1970:sinceMs / 1000.0];
    options.predicate = [NSPredicate predicateWithFormat:@"creationDate > %@", since];
  }

  PHFetchResult<PHAsset *> *assets = [PHAsset fetchAssetsWithMediaType:PHAssetMediaTypeImage
                                                               options:options];

  NSMutableArray<NSDictionary *> *results = [NSMutableArray arrayWithCapacity:assets.count];

  [assets enumerateObjectsUsingBlock:^(PHAsset *asset, NSUInteger idx, BOOL *stop) {
    CLLocation *loc = asset.location;
    if (!loc) return;

    NSTimeInterval createdAt = asset.creationDate
      ? asset.creationDate.timeIntervalSince1970 * 1000.0
      : 0;

    [results addObject:@{
      @"id":        asset.localIdentifier,
      @"lat":       @(loc.coordinate.latitude),
      @"lng":       @(loc.coordinate.longitude),
      @"createdAt": @(createdAt),
    }];
  }];

  resolve(results);
}

/**
 * Returns all iCloud Shared Albums as [{id, name, count, coverAssetId}].
 * Albums are sorted alphabetically by title.
 */
RCT_EXPORT_METHOD(getSharedAlbums:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  PHFetchOptions *albumOptions = [[PHFetchOptions alloc] init];
  albumOptions.sortDescriptors = @[[NSSortDescriptor sortDescriptorWithKey:@"localizedTitle" ascending:YES]];

  PHFetchResult<PHAssetCollection *> *albums = [PHAssetCollection
    fetchAssetCollectionsWithType:PHAssetCollectionTypeAlbum
    subtype:PHAssetCollectionSubtypeAlbumCloudShared
    options:albumOptions];

  NSMutableArray<NSDictionary *> *results = [NSMutableArray arrayWithCapacity:albums.count];

  // Options for counting all images in an album
  PHFetchOptions *countOptions = [[PHFetchOptions alloc] init];
  countOptions.predicate = [NSPredicate predicateWithFormat:@"mediaType == %d", PHAssetMediaTypeImage];

  // Options for fetching the most recent image as cover
  PHFetchOptions *coverOptions = [[PHFetchOptions alloc] init];
  coverOptions.predicate = [NSPredicate predicateWithFormat:@"mediaType == %d", PHAssetMediaTypeImage];
  coverOptions.sortDescriptors = @[[NSSortDescriptor sortDescriptorWithKey:@"creationDate" ascending:NO]];
  coverOptions.fetchLimit = 1;

  [albums enumerateObjectsUsingBlock:^(PHAssetCollection *collection, NSUInteger idx, BOOL *stop) {
    PHFetchResult<PHAsset *> *allAssets = [PHAsset fetchAssetsInAssetCollection:collection options:countOptions];
    PHFetchResult<PHAsset *> *coverAssets = [PHAsset fetchAssetsInAssetCollection:collection options:coverOptions];

    NSString *coverAssetId = coverAssets.firstObject ? coverAssets.firstObject.localIdentifier : nil;

    [results addObject:@{
      @"id":           collection.localIdentifier,
      @"name":         collection.localizedTitle ?: @"",
      @"count":        @(allAssets.count),
      @"coverAssetId": coverAssetId ?: [NSNull null],
    }];
  }];

  resolve(results);
}

/**
 * Returns geotagged photos from the given shared album IDs as [{id, lat, lng, createdAt}].
 * Deduplicates across albums by asset localIdentifier.
 */
RCT_EXPORT_METHOD(getLocationsFromAlbums:(NSArray<NSString *> *)albumIds
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSMutableSet<NSString *> *seenIds = [NSMutableSet set];
  NSMutableArray<NSDictionary *> *results = [NSMutableArray array];

  PHFetchOptions *assetOptions = [[PHFetchOptions alloc] init];
  assetOptions.predicate = [NSPredicate predicateWithFormat:@"mediaType == %d", PHAssetMediaTypeImage];

  for (NSString *albumId in albumIds) {
    PHFetchResult<PHAssetCollection *> *collections =
      [PHAssetCollection fetchAssetCollectionsWithLocalIdentifiers:@[albumId] options:nil];
    PHAssetCollection *collection = collections.firstObject;
    if (!collection) continue;

    PHFetchResult<PHAsset *> *assets = [PHAsset fetchAssetsInAssetCollection:collection options:assetOptions];

    [assets enumerateObjectsUsingBlock:^(PHAsset *asset, NSUInteger idx, BOOL *stop) {
      CLLocation *loc = asset.location;
      if (!loc) return;
      if ([seenIds containsObject:asset.localIdentifier]) return;
      [seenIds addObject:asset.localIdentifier];

      NSTimeInterval createdAt = asset.creationDate
        ? asset.creationDate.timeIntervalSince1970 * 1000.0
        : 0;

      [results addObject:@{
        @"id":        asset.localIdentifier,
        @"lat":       @(loc.coordinate.latitude),
        @"lng":       @(loc.coordinate.longitude),
        @"createdAt": @(createdAt),
      }];
    }];
  }

  resolve(results);
}

@end
