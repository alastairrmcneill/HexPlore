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

@end
