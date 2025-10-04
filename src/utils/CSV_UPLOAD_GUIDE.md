# CSV Bulk Upload Feature

## Overview
The CSV bulk upload feature allows developers to add multiple questions to the default quiz database at once by uploading a CSV file.

## How to Use

1. **Access the Developer Page**
   - Navigate to `/developer` (requires developer role)
   - The CSV upload section is at the top of the page

2. **Download the Template**
   - Click "Download template" to get a sample CSV file
   - This shows the correct format and includes example questions

3. **Prepare Your CSV File**
   - Use the template format
   - Required columns: `question,a,b,c,d,correct,category,sub-category,difficulty`
   - Save as a `.csv` file

4. **Upload Your CSV**
   - Click "Choose File" and select your CSV
   - Click "Upload CSV" to process and upload all questions
   - View upload results showing success/failure counts

## CSV Format Requirements

### Column Headers (Required Order)
```csv
question,a,b,c,d,correct,category,sub-category,difficulty
```

### Field Descriptions

- **question**: The question text (required)
- **a**: First answer option (required)
- **b**: Second answer option (required)
- **c**: Third answer option (required)
- **d**: Fourth answer option (required)
- **correct**: The correct answer - must exactly match one of a, b, c, or d (required)
- **category**: Question category, e.g., "history", "math", "science" (required)
- **sub-category**: Optional subcategory, e.g., "ancient", "algebra" (optional)
- **difficulty**: Number from 0-5, where 0 is easiest and 5 is hardest (required, defaults to 0)

### Example CSV Content

```csv
question,a,b,c,d,correct,category,sub-category,difficulty
"What is the capital of France?",Paris,London,Berlin,Madrid,Paris,geography,europe,1
"What is 2+2?",3,4,5,6,4,math,arithmetic,0
"Who wrote Hamlet?","William Shakespeare","Charles Dickens","Jane Austen","Mark Twain","William Shakespeare",literature,shakespeare,2
```

## Important Notes

### Quotes in CSV
- Use double quotes for text containing commas
- Example: `"Who said, ""To be or not to be""?"`

### Data Validation
- All required fields must be filled
- The `correct` field must exactly match one of the answer options
- Difficulty must be between 0 and 5
- Empty rows are automatically skipped

### Upload Results
After uploading, you'll see:
- Total questions processed
- Successfully added count
- Failed count (if any)
- Error details (if any failures occurred)

## Technical Details

### Files Involved
- `/src/utils/csvUploader.js` - CSV parsing and upload logic
- `/src/components/developer/AddDefaultQuestion.jsx` - UI component

### Functions

#### `parseCSV(file)`
Parses a CSV file and validates the data format.
- **Input**: File object
- **Returns**: `{ success, questions, count }` or error object

#### `bulkUploadQuestions(questions)`
Uploads an array of questions to the database.
- **Input**: Array of question objects
- **Returns**: `{ total, successful, failed, errors }`

#### `downloadCSVTemplate()`
Downloads a CSV template file with example questions.

### API Endpoint
Questions are uploaded to:
```
https://us-central1-quizmaster-c66a2.cloudfunctions.net/addDefaultQuestion
```

### Dependencies
- **papaparse**: CSV parsing library

## Troubleshooting

### "Please select a valid CSV file"
- Ensure your file has a `.csv` extension
- Check that it's a properly formatted CSV file

### "Row X: Missing required fields"
- Verify all required columns have values for that row
- Check for missing commas or incorrect column count

### Upload Failures
- Check your internet connection
- Verify the Firebase API is accessible
- Review error details in the upload results

## Best Practices

1. **Test with small batches first** - Upload 5-10 questions to verify format
2. **Keep backups** - Save your CSV files before uploading
3. **Validate data** - Double-check correct answers match options exactly
4. **Use consistent categories** - Maintain standard category names
5. **Review results** - Always check the upload results for any failures

