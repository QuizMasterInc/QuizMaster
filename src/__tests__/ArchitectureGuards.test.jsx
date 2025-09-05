import fs from 'fs';
import path from 'path';

describe('Architecture Guard Tests', () => {
  const componentPath = path.join(__dirname, '../components');
  
  test('prevents excessive micro-components (components under 25 lines)', () => {
    const checkDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      const violations = [];
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isFile() && item.endsWith('.jsx')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lineCount = content.split('\n').length;
          
          // Flag components under 25 lines as potential micro-components
          if (lineCount < 25) {
            violations.push({
              file: fullPath.replace(componentPath, ''),
              lines: lineCount
            });
          }
        } else if (stat.isDirectory() && !['ui', 'icons', 'sounds', 'node_modules', '.git'].includes(item)) {
          violations.push(...checkDirectory(fullPath));
        }
      });
      
      return violations;
    };

    const microComponents = checkDirectory(componentPath);
    
    // Allow some micro-components but warn if there are too many
    if (microComponents.length > 3) {
      console.warn('Warning: Found micro-components that could be consolidated:', microComponents);
    }
    
    // Fail test if we have more than 5 micro-components (indicates regression)
    expect(microComponents.length).toBeLessThanOrEqual(5);
  });

  test('ensures shared libraries exist and are properly structured', () => {
    const requiredLibraries = ['ui', 'icons', 'sounds'];
    
    requiredLibraries.forEach(lib => {
      const libPath = path.join(componentPath, lib);
      const indexPath = path.join(libPath, 'index.jsx');
      
      expect(fs.existsSync(libPath)).toBe(true);
      expect(fs.existsSync(indexPath)).toBe(true);
      
      // Check that index.jsx has exports
      const content = fs.readFileSync(indexPath, 'utf8');
      expect(content).toMatch(/export/);
    });
  });

  test('validates component directory count stays reasonable', () => {
    const items = fs.readdirSync(componentPath);
    const directories = items.filter(item => {
      const fullPath = path.join(componentPath, item);
      return fs.statSync(fullPath).isDirectory() && item !== '.vscode';
    });
    
    // We consolidated to 16 directories - ensure it doesn't grow beyond 20
    expect(directories.length).toBeLessThanOrEqual(20);
    
    console.log(`Current component directories: ${directories.length}`);
  });

  test('ensures single-file directories are justified', () => {
    const singleFileDirectories = [];
    
    const items = fs.readdirSync(componentPath);
    items.forEach(item => {
      const fullPath = path.join(componentPath, item);
      if (fs.statSync(fullPath).isDirectory() && item !== '.vscode') {
        const dirContents = fs.readdirSync(fullPath);
        const jsxFiles = dirContents.filter(file => file.endsWith('.jsx'));
        
        if (jsxFiles.length === 1) {
          // Check if the single file is substantial (>100 lines)
          const filePath = path.join(fullPath, jsxFiles[0]);
          const content = fs.readFileSync(filePath, 'utf8');
          const lineCount = content.split('\n').length;
          
          if (lineCount < 100) {
            singleFileDirectories.push({
              dir: item,
              file: jsxFiles[0],
              lines: lineCount
            });
          }
        }
      }
    });
    
    // Warn about single-file directories with small components
    if (singleFileDirectories.length > 0) {
      console.warn('Single-file directories with small components:', singleFileDirectories);
    }
    
    // Allow some but not too many
    expect(singleFileDirectories.length).toBeLessThanOrEqual(3);
  });

  test('validates shared library usage (prevents code duplication)', () => {
    const findDuplicatePatterns = (dir) => {
      const patterns = [];
      
      const searchFiles = (directory) => {
        const items = fs.readdirSync(directory);
        
        items.forEach(item => {
          const fullPath = path.join(directory, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isFile() && item.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Check for duplicate button patterns
            if (content.includes('bg-gradient-to-r from-purple-600 to-blue-600') && 
                !fullPath.includes('/ui/')) {
              patterns.push(`Duplicate button styling in: ${fullPath.replace(componentPath, '')}`);
            }
            
            // Check for duplicate icon definitions
            if (content.includes('<svg') && 
                content.includes('viewBox="0 0 24 24"') && 
                !fullPath.includes('/icons/')) {
              patterns.push(`Potential duplicate icon in: ${fullPath.replace(componentPath, '')}`);
            }
          } else if (stat.isDirectory() && !['node_modules', '.git'].includes(item)) {
            searchFiles(fullPath);
          }
        });
      };
      
      searchFiles(dir);
      return patterns;
    };

    const duplicates = findDuplicatePatterns(componentPath);
    
    if (duplicates.length > 0) {
      console.warn('Potential code duplication found:', duplicates);
    }
    
    // Allow some duplication but warn if it's excessive
    expect(duplicates.length).toBeLessThanOrEqual(2);
  });

  test('ensures proper documentation exists for major directories', () => {
    const majorDirectories = ['ui', 'icons', 'sounds'];
    
    majorDirectories.forEach(dir => {
      const dirPath = path.join(componentPath, dir);
      const docFiles = fs.readdirSync(dirPath).filter(file => file.endsWith('.md'));
      
      expect(docFiles.length).toBeGreaterThanOrEqual(1);
    });
    
    // Check for main architecture documentation
    const archDoc = path.join(componentPath, 'COMPONENTS_ARCHITECTURE.md');
    expect(fs.existsSync(archDoc)).toBe(true);
  });
});
