# Notification Sounds

This directory contains custom notification sounds for sunrise and sunset events.

## Required Sound Files

You need to add two `.wav` audio files to this directory:

### 1. sunrise.wav
- **Purpose**: Played when sunrise notification triggers
- **Recommended Style**: Bright, uplifting, energetic tone
- **Duration**: 2-3 seconds
- **Suggestions**:
  - Gentle chimes or bells with ascending tones
  - Light piano melody
  - Soft marimba or xylophone sounds
  - Nature sounds like birds chirping

### 2. sunset.wav
- **Purpose**: Played when sunset notification triggers
- **Recommended Style**: Calming, peaceful, relaxing tone
- **Duration**: 2-3 seconds
- **Suggestions**:
  - Gentle chimes or bells with descending tones
  - Soft synthesizer pad
  - Warm acoustic guitar notes
  - Nature sounds like ocean waves

## Where to Find Sound Files

### Free Sound Resources:
1. **Freesound.org** - Community-driven library of free sounds
2. **Zapsplat.com** - Free sound effects (attribution required)
3. **YouTube Audio Library** - Royalty-free sound effects
4. **Pixabay** - Free sound effects
5. **BBC Sound Effects** - Free for personal use

### Creating Your Own:
You can use audio editing software like:
- **Audacity** (Free) - Create simple tones and effects
- **GarageBand** (Mac/iOS) - Create musical notifications
- **FL Studio Mobile** - Create custom melodies

## Technical Requirements

- **Format**: WAV (Waveform Audio File Format)
- **Sample Rate**: 44.1 kHz or 48 kHz
- **Bit Depth**: 16-bit
- **Channels**: Mono or Stereo
- **Duration**: Keep under 5 seconds for best user experience
- **File Size**: Keep files small (under 500KB each) for app performance

## Adding Sound Files

1. Download or create your sound files
2. Convert them to `.wav` format if needed
3. Rename them to exactly:
   - `sunrise.wav`
   - `sunset.wav`
4. Place them in this directory (`assets/sounds/`)
5. Rebuild your app using `npx expo prebuild` (if using bare workflow)

## Testing

After adding the sound files:
1. Set up a test notification for 1 minute in the future
2. Ensure your device volume is up and not on silent mode
3. Verify the correct sound plays for each notification type

## Note for iOS

iOS requires sound files to be in specific formats. WAV files work, but you can also use:
- `.aiff` (Audio Interchange File Format)
- `.caf` (Core Audio Format) - Recommended for iOS

If you experience issues on iOS, consider converting your WAV files to CAF format using:
```bash
afconvert -f caff -d LEI16 sunrise.wav sunrise.caf
afconvert -f caff -d LEI16 sunset.wav sunset.caf
```

Then update the references in the code from `.wav` to `.caf`.
