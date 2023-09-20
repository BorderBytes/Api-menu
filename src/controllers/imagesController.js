app.get('/images/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, '..', 'public', 'images', filename);
    
    fs.access(filepath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('Error accessing file:', err.stack);
        res.status(404).send('Image not found');
        return;
      }
  
      res.sendFile(filepath);
    });
  });
  