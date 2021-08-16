const { Storage } = require('@google-cloud/storage')

const storage = new Storage({ keyFilename: './battery-capacity-prediction-794a7b32748e.json' })


const bucketName = 'battery-capacity-prediction'
async function generateV4UploadSignedUrl(fileName) {

    const options = {
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
    const [url] = await storage
        .bucket(bucketName)
        .file(`data/${fileName}`)
        .getSignedUrl(options);
    // console.log('Generated PUT signed URL:');
    // console.log(url);
    return url;
}

// The origin for this CORS config to allow requests from
const origin = 'http://localhost:3000';

// The response header to share across origins
const responseHeader = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

// The maximum amount of time the browser can make requests before it must
// repeat preflighted requests
const maxAgeSeconds = 3600;

// The name of the method
// See the HttpMethod documentation for other HTTP methods available:
// https://cloud.google.com/appengine/docs/standard/java/javadoc/com/google/appengine/api/urlfetch/HTTPMethod
const method = 'PUT';

async function configureBucketCors() {
    await storage.bucket(bucketName).setCorsConfiguration([
        {
            maxAgeSeconds,
            method: ['*'],
            origin: ['*'],
            responseHeader: ['*'],
        },
    ]);

    console.log(`Bucket ${bucketName} was updated with a CORS config
        to allow ${method} requests from ${origin} sharing 
        ${responseHeader} responses across origins`);
}


configureBucketCors().catch(console.error);

exports.generateV4UploadSignedUrl = generateV4UploadSignedUrl