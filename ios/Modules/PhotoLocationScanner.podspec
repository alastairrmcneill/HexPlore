Pod::Spec.new do |spec|
  spec.name         = 'PhotoLocationScanner'
  spec.version      = '1.0.0'
  spec.summary      = 'Reads PHAsset.location for fast geotagged-photo scanning'
  spec.license      = { :type => 'MIT' }
  spec.authors      = { 'HexPlore' => 'hello@hexplore.app' }
  spec.homepage     = 'https://hexplore.app'
  spec.platforms    = { :ios => '15.1' }
  spec.source       = { :git => '' }
  spec.source_files = '*.{h,m}'
  spec.frameworks   = 'Photos', 'CoreLocation'
  spec.dependency     'React-Core'
end
